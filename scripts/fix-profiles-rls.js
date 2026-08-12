process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*'(.*)'\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  });
}

const client = new Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  console.log('Checking existing RLS policies on profiles...');
  const policies = await client.query(`
    SELECT policyname, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public'
    ORDER BY policyname;
  `);
  console.log('Existing policies:');
  console.log(JSON.stringify(policies.rows, null, 2));

  console.log('\nChecking if RLS is enabled on profiles...');
  const rlsStatus = await client.query(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
  `);
  console.log('RLS Status:', JSON.stringify(rlsStatus.rows, null, 2));

  console.log('\nApplying fix: Ensure users can SELECT their own profile...');

  // Ensure RLS is enabled
  await client.query(`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`);

  // Drop potentially conflicting policy
  await client.query(`DROP POLICY IF EXISTS "Users can view own profile" ON profiles;`);

  // Create policy allowing users to read their own profile
  await client.query(`
    CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
  `);

  // Ensure admins can read all profiles
  await client.query(`DROP POLICY IF EXISTS "Admins full access profiles" ON profiles;`);
  await client.query(`
    CREATE POLICY "Admins full access profiles"
    ON profiles FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() AND p.is_owner = true
      )
    );
  `);

  console.log('✅ RLS policies applied successfully!');

  // Verify
  const newPolicies = await client.query(`
    SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public' ORDER BY policyname;
  `);
  console.log('Updated policies:', JSON.stringify(newPolicies.rows, null, 2));

  await client.end();
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
