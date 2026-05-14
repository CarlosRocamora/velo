export interface DbConnectionTarget {
  originalHost: string
  port: number
  user: string | undefined
  password: string | undefined
  database: string
}

export function parseDbUrl(connectionString: string): DbConnectionTarget | null {
  try {
    const u = new URL(connectionString)
    const path = (u.pathname || '/').replace(/^\//, '')
    return {
      originalHost: u.hostname,
      port: u.port ? Number(u.port) : 5432,
      user: u.username ? decodeURIComponent(u.username) : undefined,
      password: u.password ? decodeURIComponent(u.password) : undefined,
      database: path || 'postgres',
    }
  } catch {
    return null
  }
}

/**
 * Host `db.<ref>.supabase.co` costuma ser só AAAA (IPv6). O pooler session (5432)
 * em `aws-0-<região>.pooler.supabase.com` expõe A (IPv4).
 */
export function tryRewriteSupabaseDbHostToPooler(target: DbConnectionTarget): DbConnectionTarget {
  if (process.env.DATABASE_USE_SUPABASE_POOLER === '0') {
    return target
  }
  const m = /^db\.([a-z0-9]+)\.supabase\.co$/i.exec(target.originalHost)
  if (!m) {
    return target
  }
  const ref = m[1]
  const region =
    process.env.PLAYWRIGHT_SUPABASE_POOLER_REGION ||
    process.env.SUPABASE_POOLER_REGION ||
    process.env.VITE_SUPABASE_REGION ||
    'us-west-2'
  const prefix = process.env.PLAYWRIGHT_SUPABASE_POOLER_ROUTE_PREFIX || 'aws-0'
  return {
    ...target,
    originalHost: `${prefix}-${region}.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${ref}`,
  }
}

export function isSupabaseHost(host: string): boolean {
  return host.endsWith('.supabase.co') || host.endsWith('.pooler.supabase.com')
}
