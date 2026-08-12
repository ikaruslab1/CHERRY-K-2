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

  // Check if is_staff_or_admin() function exists
  console.log('Checking if is_staff_or_admin() function exists...');
  const funcCheck = await client.query(`
    SELECT proname, prosrc 
    FROM pg_proc 
    WHERE proname = 'is_staff_or_admin'
    LIMIT 1;
  `);
  if (funcCheck.rows.length === 0) {
    console.log('❌ FUNCTION is_staff_or_admin() DOES NOT EXIST - this is the problem!');
    console.log('Dropping the broken policy and recreating without it...');
    
    // Drop the policy with the missing function
    await client.query(`DROP POLICY IF EXISTS "Staff and admin can read all profiles" ON profiles;`);
    console.log('✅ Removed broken policy "Staff and admin can read all profiles"');

    // Re-create it with a working version without the missing function
    await client.query(`
      CREATE POLICY "Staff and admin can read all profiles"
      ON profiles FOR SELECT
      USING (
        is_owner = true
        OR EXISTS (
          SELECT 1 FROM conference_roles
          WHERE conference_roles.user_id = auth.uid()
          AND conference_roles.role IN ('admin', 'owner', 'staff')
        )
      );
    `);
    console.log('✅ Recreated policy without broken is_staff_or_admin() function');
  } else {
    console.log('✅ Function is_staff_or_admin() exists:', funcCheck.rows[0].prosrc);
  }

  // Verify policies
  const policies = await client.query(`
    SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public';
  `);
  console.log('\nFinal policies:', JSON.stringify(policies.rows, null, 2));

  await client.end();
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
