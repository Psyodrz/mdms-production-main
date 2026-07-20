import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const result = await backendFetch(`/admin/users/${id}/reactivate`, {
    method: 'PATCH',
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
