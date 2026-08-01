import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/cms/server/guard';

/**
 * Server-side media upload for the CMS.
 *
 * Uploads via the Supabase service-role key, which bypasses Storage RLS — so it
 * works even when a bucket has no INSERT policy (client-side anon uploads would
 * be rejected there). Returns a permanent public URL.
 */

const BUCKET = 'mp-public';

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const folder = (form?.get('folder') as string) || 'portfolio';

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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
    // Missing SUPABASE_SERVICE_ROLE_KEY surfaces here — return a clear message.
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
