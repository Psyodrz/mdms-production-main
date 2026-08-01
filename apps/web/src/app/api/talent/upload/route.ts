import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { auth } from '@/auth';

/**
 * Authenticated media upload for talent onboarding / profile edit.
 *
 * Uploads via the Supabase service-role key (bypasses Storage RLS, so it works
 * even when a bucket has no INSERT policy). Any signed-in user may upload their
 * own media; the file is namespaced under their user id.
 */
const BUCKET = 'mp-public';
const ALLOWED_FOLDERS = new Set(['avatars', 'covers', 'videos', 'gallery', 'documents']);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const folderRaw = (form?.get('folder') as string) || 'gallery';
  const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : 'gallery';

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'bin';
  // Namespace under the authenticated user's id — no client-controlled path.
  const path = `talent/${session.user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const supabase = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type || undefined, upsert: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || 'Upload failed' },
        { status: 502 },
      );
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload processing error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
