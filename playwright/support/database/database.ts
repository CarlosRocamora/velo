import path from 'node:path'
import dotenv from 'dotenv'

// Garante valores do .env da raiz do projeto (Playwright roda com cwd = raiz) e
// sobrescreve variáveis herdadas do shell (ex.: região do pooler errada).
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })

import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

const SUPABASE_CONNECT_DOC =
  'https://supabase.com/docs/guides/database/connecting-to-postgres'

/** Host direto do projeto na porta 5432: IPv6-only no Supabase. */
function isSupabaseDirectDbHost(hostname: string): boolean {
  return /^db\.[^.]+\.supabase\.co$/i.test(hostname)
}

function supabaseProjectRef(hostname: string): string | null {
  return hostname.match(/^db\.([^.]+)\.supabase\.co$/i)?.[1] ?? null
}

/**
 * Session pooler (IPv4): postgres.<ref> @ <prefix>-<region>.pooler.supabase.com:5432
 * O prefixo costuma ser aws-0; alguns projetos usam aws-1 (senão o Supavisor retorna "Tenant or user not found").
 */
function buildSupabaseSessionPoolerUri(directUrl: string, region: string): string {
  const u = new URL(directUrl)
  const ref = supabaseProjectRef(u.hostname)
  if (!ref) {
    throw new Error(`URL direta do Supabase inválida para montar o pooler: ${u.hostname}`)
  }
  const password = u.password ? decodeURIComponent(u.password) : ''
  const user = `postgres.${ref}`
  const routePrefix =
    process.env.PLAYWRIGHT_SUPABASE_POOLER_ROUTE_PREFIX?.trim() || 'aws-0'
  const host = `${routePrefix}-${region}.pooler.supabase.com`
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/postgres`
}

function resolvePlaywrightConnectionString(): string {
  const explicit = process.env.PLAYWRIGHT_DATABASE_URL?.trim()
  if (explicit) return explicit

  const direct = process.env.DATABASE_URL?.trim()
  if (!direct) {
    throw new Error(
      `Defina DATABASE_URL (e opções de pooler abaixo) para os helpers de banco do Playwright. ${SUPABASE_CONNECT_DOC}`,
    )
  }

  let hostname = ''
  try {
    hostname = new URL(direct).hostname
  } catch {
    return direct
  }

  const poolerRegion = process.env.PLAYWRIGHT_SUPABASE_POOLER_REGION?.trim()
  if (poolerRegion && isSupabaseDirectDbHost(hostname)) {
    return buildSupabaseSessionPoolerUri(direct, poolerRegion)
  }

  if (
    isSupabaseDirectDbHost(hostname) &&
    process.env.PLAYWRIGHT_ALLOW_SUPABASE_DIRECT !== '1'
  ) {
    throw new Error(
      [
        `Playwright: "${hostname}" (porta 5432 direta) é IPv6-only no Supabase e costuma falhar com ETIMEDOUT em redes sem IPv6.`,
        '',
        'Opções:',
        '  1) Defina PLAYWRIGHT_SUPABASE_POOLER_REGION (ex.: us-east-2) e, se o Dashboard mostrar host aws-1-..., também PLAYWRIGHT_SUPABASE_POOLER_ROUTE_PREFIX=aws-1. O DATABASE_URL direto continua no .env.',
        '  2) Ou copie a URI "Session pooler" do Dashboard (Connect → Session) em PLAYWRIGHT_DATABASE_URL.',
        '  3) Ou use PLAYWRIGHT_ALLOW_SUPABASE_DIRECT=1 se sua rede tiver IPv6 funcional.',
        '',
        SUPABASE_CONNECT_DOC,
      ].join('\n'),
    )
  }

  return direct
}

const connectionString = resolvePlaywrightConnectionString()

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
      max: 10,
    }),
  }),
})
