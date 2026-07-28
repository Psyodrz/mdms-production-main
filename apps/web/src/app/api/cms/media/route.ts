import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }

    // Prepare FormData for NestJS API
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Forward to NestJS API /files/upload with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const result = await backendFetch<{ id?: string; url?: string; fileUrl?: string }>('/files/upload', {
        method: 'POST',
        body: backendFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (result.ok && result.data) {
        const url = (result.data as any).url || (result.data as any).fileUrl;
        if (url) {
          return NextResponse.json({
            ok: true,
            status: 200,
            url,
            data: { url, id: (result.data as any).id || `media-${Date.now()}` },
          });
        }
      }
    } catch (apiErr) {
      clearTimeout(timeoutId);
      console.warn('NestJS file upload timeout or error:', apiErr);
    }

    // Graceful fallback response instructing client to use direct Supabase upload if needed
    return NextResponse.json({
      ok: false,
      error: 'API upload timeout. Using direct storage fallback.',
    }, { status: 504 });

  } catch (err: any) {
    console.error('BFF Media route error:', err);
    return NextResponse.json({
      ok: false,
      error: err?.message || 'Upload processing error',
    }, { status: 500 });
  }
}
