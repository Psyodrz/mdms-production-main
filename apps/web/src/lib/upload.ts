import { createClient } from '@/utils/supabase/client'

export type StorageBucket = 'mp-public' | 'mp-private' | 'mp-cms'

/**
 * Upload a file directly to Supabase Storage from the browser.
 *
 * Uses the anon key (RLS‑protected) so the user must be authenticated
 * for private/CMS buckets.  Returns the public URL of the uploaded file.
 *
 * @example
 * const url = await uploadToSupabase({
 *   file,
 *   bucket: 'mp-public',
 *   folder: 'talent/avatars',
 * })
 */
export async function uploadToSupabase({
  file,
  bucket,
  folder,
}: {
  file: File
  bucket: StorageBucket
  folder: string
}): Promise<string> {
  const supabase = createClient()

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `${folder}/${filename}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) {
    // Client (anon/authenticated) upload was rejected — most commonly because
    // the bucket has no INSERT RLS policy. Fall back to the authenticated
    // server route which uploads with the service-role key (bypasses RLS).
    return uploadViaServer(file, bucket, folder)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/** Server-side (service-role) upload fallback. */
async function uploadViaServer(file: File, bucket: string, folder: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('bucket', bucket)
  fd.append('folder', folder)
  const res = await fetch('/api/storage/upload', { method: 'POST', body: fd })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok || !json?.url) {
    throw new Error(json?.error || 'Upload failed')
  }
  return json.url as string
}

/**
 * Upload talent media through the authenticated server route (service-role),
 * which bypasses Storage RLS. Use this instead of the direct client upload for
 * talent onboarding / profile edit so uploads work regardless of bucket policies.
 *
 * @param folder one of: avatars | covers | videos | gallery | documents
 */
export async function uploadTalentMedia(file: File, folder: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch('/api/talent/upload', { method: 'POST', body: fd })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok || !json?.url) {
    throw new Error(json?.error || 'Upload failed')
  }
  return json.url as string
}

/**
 * Generic authenticated upload through the server route (service-role, bypasses
 * Storage RLS). Use for editor/client/CMS media so uploads work regardless of
 * bucket INSERT policies. Returns a permanent public URL.
 */
export async function serverUpload(
  file: File,
  opts: { bucket?: StorageBucket; folder?: string } = {},
): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('bucket', opts.bucket || 'mp-public')
  fd.append('folder', opts.folder || 'misc')
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok || !json?.url) {
    throw new Error(json?.error || 'Upload failed')
  }
  return json.url as string
}
