import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({ lessons: [] }));

  const result = await backendFetch(`/cms/admin/courses/${encodeURIComponent(id)}/lessons`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  return NextResponse.json({ ok: true, status: 200, data: { id, ...body } });
}
