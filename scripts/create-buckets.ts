/**
 * One-time script to create the 3 Supabase Storage buckets.
 *
 * Run with:
 *   npx ts-node scripts/create-buckets.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  // mp-public — talent avatars, casting media (public reads)
  const { error: e1 } = await supabase.storage.createBucket('mp-public', {
    public: true,
    fileSizeLimit: 10485760, // 10 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
  })
  if (e1 && !e1.message.includes('already exists')) {
    console.error('mp-public error:', e1.message)
  } else {
    console.log('✅ mp-public bucket ready')
  }

  // mp-private — client docs, project attachments, editor videos (authenticated only)
  const { error: e2 } = await supabase.storage.createBucket('mp-private', {
    public: false,
    fileSizeLimit: 52428800, // 50 MB
    allowedMimeTypes: ['image/*', 'application/pdf', 'video/mp4', 'video/webm', 'video/x-m4v'],
  })
  if (e2 && !e2.message.includes('already exists')) {
    console.error('mp-private error:', e2.message)
  } else {
    console.log('✅ mp-private bucket ready')
  }

  // mp-cms — hero banners, gallery, blog covers (public reads, admin writes)
  const { error: e3 } = await supabase.storage.createBucket('mp-cms', {
    public: true,
    fileSizeLimit: 524288000, // 500 MB
    allowedMimeTypes: ['image/*', 'video/mp4', 'video/webm'],
  })
  if (e3 && !e3.message.includes('already exists')) {
    console.error('mp-cms error:', e3.message)
  } else {
    console.log('✅ mp-cms bucket ready')
  }

  console.log('\n🎉 All 3 buckets created / verified')
}

main()
