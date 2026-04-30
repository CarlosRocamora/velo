import pg from 'pg';

const testConnections = [
  'postgresql://postgres.jzwyjnspmzuycvpfoyof:CVMDOJTskEq07nBv@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  'postgresql://postgres:CVMDOJTskEq07nBv@db.jzwyjnspmzuycvpfoyof.supabase.co:5432/postgres',
  'postgresql://postgres.jzwyjnspmzuycvpfoyof:CVMDOJTskEq07nBv@aws-0-us-west-2.pooler.supabase.com:6543/postgres'
];

async function tryConnect() {
  for (const uri of testConnections) {
    console.log(`Trying ${uri}...`);
    const pool = new pg.Pool({ connectionString: uri, max: 1, connectionTimeoutMillis: 5000 });
    try {
      const client = await pool.connect();
      console.log(`SUCCESS: ${uri}`);
      client.release();
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    } finally {
      pool.end();
    }
  }
}

tryConnect();
