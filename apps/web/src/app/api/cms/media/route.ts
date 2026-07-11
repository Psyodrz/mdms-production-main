import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.toString();
  const result = await backendFetch(`/files/assets?${query}`);
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const result = await backendFetch('/files/upload', {
      method: 'POST',
      body: formData,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : result.status });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
