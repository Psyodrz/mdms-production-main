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

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
