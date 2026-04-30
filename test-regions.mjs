import pg from 'pg';

const regions = [
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'ca-central-1'
];

async function tryConnect() {
  const promises = regions.map(async (region) => {
    const uri = `postgresql://postgres.jzwyjnspmzuycvpfoyof:CVMDOJTskEq07nBv@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const pool = new pg.Pool({ connectionString: uri, max: 1, connectionTimeoutMillis: 5000 });
    try {
      const client = await pool.connect();
      console.log(`SUCCESS: ${uri}`);
      client.release();
    } catch (err) {
      if (!err.message.includes('not found') && !err.message.includes('Tenant or user')) {
         console.log(`REGION FOUND BUT OTHER ERROR (${region}): ${err.message}`);
      }
    } finally {
      pool.end();
    }
  });

  await Promise.all(promises);
  console.log('Done testing regions (port 6543).');
}

tryConnect();
