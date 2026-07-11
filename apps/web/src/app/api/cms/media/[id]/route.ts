import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const result = await backendFetch(`/files/assets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
