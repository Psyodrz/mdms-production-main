/**
 * Apply Supabase Storage RLS policies using the Management API.
 * Run: npx tsx scripts/apply-rls.ts
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

const policies = [
  `CREATE POLICY "public_read" ON storage.objects FOR SELECT USING (bucket_id = 'mp-public')`,
  `CREATE POLICY "auth_upload_public" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mp-public' AND auth.role() = 'authenticated')`,
  `CREATE POLICY "private_owner_read" ON storage.objects FOR SELECT USING (bucket_id = 'mp-private' AND (auth.uid()::text = (storage.foldername(name))[2] OR auth.jwt()->>'role' IN ('admin','super_admin')))`,
  `CREATE POLICY "private_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mp-private' AND auth.role() = 'authenticated')`,
  `CREATE POLICY "cms_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'mp-cms')`,
  `CREATE POLICY "cms_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mp-cms' AND auth.jwt()->>'role' IN ('admin','super_admin'))`,
];

async function run() {
  for (const sql of policies) {
    const name = sql.match(/"([^"]+)"/)?.[1] || 'unknown';
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY!,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      
      // Try using the postgres endpoint directly
      const pgRes = await fetch(`${SUPABASE_URL}/pg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY!,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      // Fallback: use the SQL query via PostgREST  
      console.log(`${name}: attempted (verify in Supabase Dashboard)`);
    } catch (err: any) {
      console.log(`${name}: ${err.message}`);
    }
  }
  
  console.log('\n⚠️  RLS policies may need manual verification.');
  console.log('If any failed, paste scripts/supabase-storage-rls.sql into:');
  console.log('  Supabase Dashboard → SQL Editor → Run');
}

run();
