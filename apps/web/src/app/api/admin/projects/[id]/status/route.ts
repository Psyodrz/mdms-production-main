import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ id: string }> };

/** Update project status — session-authenticated BFF (ADMIN/SUPER_ADMIN). */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const result = await backendFetch(`/admin/projects/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error || 'Failed to update status' },
      { status: result.status && result.status >= 400 ? result.status : 502 },
    );
  }
  return NextResponse.json({ success: true, data: result.data });
}
