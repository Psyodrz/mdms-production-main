import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ id: string }> };

/**
 * BFF proxy for moderating a talent profile (approve / reject / suspend).
 * Authenticates server-side with the CMS service token and forwards the
 * `{ status, reviewNote? }` payload to the NestJS API.
 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const result = await backendFetch(`/talent/${encodeURIComponent(id)}/moderate`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
