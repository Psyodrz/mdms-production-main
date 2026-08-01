import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ id: string }> };

/** Project detail — session-authenticated BFF (see ../route.ts). */
export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const result = await backendFetch(`/admin/projects/${encodeURIComponent(id)}`);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error || 'Failed to load project' },
      { status: result.status && result.status >= 400 ? result.status : 502 },
    );
  }
  return NextResponse.json({ success: true, data: result.data });
}
