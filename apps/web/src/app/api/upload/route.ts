import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { auth } from '@/auth';

/**
 * Generic authenticated media upload (service-role → bypasses Storage RLS).
 * Any signed-in user may upload; the object is namespaced under their user id.
 * Returns a permanent public URL.
 */
const ALLOWED_BUCKETS = new Set(['mp-public', 'mp-private', 'mp-cms']);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const bucketRaw = (form?.get('bucket') as string) || 'mp-public';
  const bucket = ALLOWED_BUCKETS.has(bucketRaw) ? bucketRaw : 'mp-public';
  const folderRaw = (form?.get('folder') as string) || 'misc';
  const folder = folderRaw.replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 64) || 'misc';

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const supabase = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type || undefined, upsert: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || 'Upload failed' },
        { status: 502 },
      );
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload processing error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
