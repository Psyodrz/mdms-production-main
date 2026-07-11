import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ modelType: string; id: string }> };

export async function PATCH(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { modelType, id } = await ctx.params;
  const result = await backendFetch(
    `/cms/admin/recycle-bin/${encodeURIComponent(modelType)}/${encodeURIComponent(id)}/restore`,
    { method: 'PATCH' },
  );
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { modelType, id } = await ctx.params;
  const result = await backendFetch(
    `/cms/admin/recycle-bin/${encodeURIComponent(modelType)}/${encodeURIComponent(id)}/permanent`,
    { method: 'DELETE' },
  );
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
