import 'dotenv/config'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import dns from 'node:dns'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'
import {
  parseDbUrl,
  tryRewriteSupabaseDbHostToPooler,
  isSupabaseHost,
} from './connectionTarget'

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first')
}

type PgPoolOptions = ConstructorParameters<typeof pg.Pool>[0]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolveIpv4Script = path.join(__dirname, 'resolve-ipv4.mjs')
/** Preenchido por `playwright/global-setup.ts` antes dos workers. */
const ipv4CacheFile = path.join(__dirname, '../../.cache/db-ipv4.json')

function poolOptions(): PgPoolOptions {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  if (process.env.DATABASE_SKIP_IPV4_RESOLVE === '1') {
    return { connectionString, max: 10 }
  }

  const parsed = parseDbUrl(connectionString)
  if (!parsed) {
    return { connectionString, max: 10 }
  }

  const target = tryRewriteSupabaseDbHostToPooler(parsed)

  const { originalHost, port, user, password, database } = target

  if (originalHost === '' || isIpv4Literal(originalHost) || isIpv6Literal(originalHost)) {
    return { connectionString, max: 10 }
  }

  const ipv4 =
    readIpv4FromGlobalSetupCache(originalHost) ?? resolveFirstIpv4(originalHost)
  if (!ipv4) {
    return { connectionString, max: 10 }
  }

  const wantsTls =
    /sslmode=require/i.test(connectionString) || isSupabaseHost(originalHost)

  const base: PgPoolOptions = {
    host: ipv4,
    port,
    user,
    password,
    database,
    max: 10,
    connectionTimeoutMillis: 15_000,
  }

  if (wantsTls) {
    base.ssl = { rejectUnauthorized: false, servername: originalHost }
  }

  return base
}

function resolveFirstIpv4(hostname: string): string | null {
  if (!/^[\w.-]+$/.test(hostname)) {
    return null
  }

  if (typeof dns.resolve4Sync === 'function') {
    try {
      const a = dns.resolve4Sync(hostname)
      const ip = a[0]
      if (ip && isIpv4Literal(ip)) return ip
    } catch {
      /* continua */
    }
    const prev = dns.getServers()
    dns.setServers(['1.1.1.1', '8.8.8.8'])
    try {
      const a = dns.resolve4Sync(hostname)
      const ip = a[0]
      if (ip && isIpv4Literal(ip)) return ip
    } catch {
      /* continua */
    } finally {
      dns.setServers(prev)
    }
  }

  if (typeof dns.lookupSync === 'function') {
    try {
      const ip = dns.lookupSync(hostname, { family: 4 }).address
      if (ip && isIpv4Literal(ip)) return ip
    } catch {
      /* continua */
    }
  }

  const r = spawnSync(process.execPath, [resolveIpv4Script, hostname], {
    encoding: 'utf8',
    maxBuffer: 64,
    windowsHide: true,
    timeout: 12_000,
  })
  const ip = r.stdout?.trim()
  if (r.status === 0 && ip && isIpv4Literal(ip)) {
    return ip
  }
  return null
}

function readIpv4FromGlobalSetupCache(hostname: string): string | null {
  try {
    const raw = fs.readFileSync(ipv4CacheFile, 'utf8')
    const data = JSON.parse(raw) as { hostname?: string; ipv4?: string }
    if (data.hostname === hostname && data.ipv4 && isIpv4Literal(data.ipv4)) {
      return data.ipv4
    }
  } catch {
    return null
  }
  return null
}

function isIpv4Literal(host: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(host)
}

function isIpv6Literal(host: string): boolean {
  return host.includes(':')
}

let kysely: Kysely<Database> | undefined

/** Inicialização preguiçosa: evita falha no import do spec e adia o pool. */
export function getDb(): Kysely<Database> {
  if (!kysely) {
    const dialect = new PostgresDialect({
      pool: new pg.Pool(poolOptions()),
    })
    kysely = new Kysely<Database>({ dialect })
  }
  return kysely
}
