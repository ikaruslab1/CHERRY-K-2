process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*'(.*)'\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
}

const client = new Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  console.log('\n=== AUTH USERS ===');
  const authUsers = await client.query(`SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;`);
  console.log(JSON.stringify(authUsers.rows, null, 2));

  console.log('\n=== PROFILES ===');
  const profiles = await client.query(`SELECT id, short_id, username, first_name, last_name, email FROM profiles ORDER BY created_at DESC LIMIT 10;`);
  console.log(JSON.stringify(profiles.rows, null, 2));

  console.log('\n=== COLUMNS IN PROFILES ===');
  const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public' ORDER BY ordinal_position;`);
  cols.rows.forEach(r => console.log(` - ${r.column_name}: ${r.data_type}`));

  await client.end();
}

run().catch(err => { console.error(err); process.exit(1); });
