/**
 * Subprocesso síncrono (spawnSync) para obter um A record em Node ≥24,
 * onde dns.lookupSync / resolve4Sync não existem mais no módulo `dns`.
 */
import * as dns from 'node:dns/promises'

const host = process.argv[2]
if (!host) process.exit(1)

const ipv4re = /^(\d{1,3}\.){3}\d{1,3}$/

async function main() {
  const attempts = [
    () => dns.resolve4(host).then((a) => a[0]),
    async () => {
      const r = new dns.Resolver()
      r.setServers(['1.1.1.1', '8.8.8.8'])
      const a = await r.resolve4(host)
      return a[0]
    },
  ]
  for (const run of attempts) {
    try {
      const ip = await run()
      if (ip && ipv4re.test(ip)) {
        console.log(ip)
        return
      }
    } catch {
      /* próximo */
    }
  }
  process.exit(1)
}

await main()
