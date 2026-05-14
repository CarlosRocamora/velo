import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as dns from 'node:dns/promises'
import dotenv from 'dotenv'
import { parseDbUrl, tryRewriteSupabaseDbHostToPooler } from './support/database/connectionTarget'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

dotenv.config({ path: path.join(rootDir, '.env') })

const CACHE_FILE = path.join(__dirname, '.cache', 'db-ipv4.json')

const ipv4re = /^(\d{1,3}\.){3}\d{1,3}$/

async function resolveIpv4(hostname: string): Promise<string | null> {
  try {
    const a = await dns.resolve4(hostname)
    if (a[0] && ipv4re.test(a[0])) return a[0]
  } catch {
    /* tenta DNS público */
  }
  try {
    const r = new dns.Resolver()
    r.setServers(['1.1.1.1', '8.8.8.8'])
    const a = await r.resolve4(hostname)
    if (a[0] && ipv4re.test(a[0])) return a[0]
  } catch {
    /* tenta DoH */
  }
  return await resolveIpv4ViaDoh(hostname)
}

/** Quando DNS UDP falha, HTTPS costuma ainda passar. */
async function resolveIpv4ViaDoh(hostname: string): Promise<string | null> {
  try {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return null
    const json = (await res.json()) as { Status?: number; Answer?: { type?: number; data?: string }[] }
    if (json.Status !== 0 || !json.Answer?.length) return null
    for (const ans of json.Answer) {
      if (ans.type === 1 && ans.data) {
        const ip = ans.data.replace(/\.$/, '')
        if (ipv4re.test(ip)) return ip
      }
    }
  } catch {
    return null
  }
  return null
}

/**
 * Roda num processo dedicado antes dos workers. Grava IPv4 (A) para o host
 * efetivo (após rewrite pooler, se for Supabase direto).
 */
export default async function globalSetup(): Promise<void> {
  if (process.env.DATABASE_SKIP_IPV4_RESOLVE === '1') {
    return
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return
  }

  const parsed = parseDbUrl(connectionString)
  if (!parsed) {
    return
  }

  const target = tryRewriteSupabaseDbHostToPooler(parsed)
  const hostname = target.originalHost

  if (!hostname || ipv4re.test(hostname) || hostname.includes(':')) {
    return
  }

  const ipv4 = await resolveIpv4(hostname)
  if (!ipv4) {
    console.warn(
      `[playwright global-setup] Sem IPv4 (A) para ${hostname}. ` +
        'Ajuste SUPABASE_POOLER_REGION se usar pooler, ou rede/DNS.',
    )
    try {
      fs.unlinkSync(CACHE_FILE)
    } catch {
      /* ok */
    }
    return
  }

  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true })
  fs.writeFileSync(CACHE_FILE, JSON.stringify({ hostname, ipv4, savedAt: Date.now() }), 'utf8')
}
