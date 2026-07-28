import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { users, overwriteExisting = true } = body;

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ ok: false, error: 'No user records provided in file.' }, { status: 400 });
    }

    const result = await backendFetch('/admin/users/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ users, overwriteExisting }),
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'Bulk import failed' }, { status: result.status });
    }

    const payload: any = result.data;
    const data = payload?.data ?? payload;

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
