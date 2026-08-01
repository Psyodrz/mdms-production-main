import { NextRequest, NextResponse } from 'next/server';
import { getResource } from '@/lib/cms/resources';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

/**
 * Explicit BFF handlers for updating/deleting a single course.
 * See ../route.ts for why these cannot use the generic `[resource]` route.
 */

type Ctx = { params: Promise<{ id: string }> };
const COURSES = 'courses';

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const cfg = getResource(COURSES);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const result =
    cfg.backend.updateMode === 'upsert'
      ? await backendFetch(cfg.backend.base, { method: 'POST', body: JSON.stringify(body) })
      : await backendFetch(`${cfg.backend.base}/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });

  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }
  return NextResponse.json(
    { ok: false, error: result.error || 'Failed to update course' },
    { status: result.status && result.status >= 400 ? result.status : 502 },
  );
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const cfg = getResource(COURSES);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });

  const result = await backendFetch(`${cfg.backend.base}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }
  return NextResponse.json(
    { ok: false, error: result.error || 'Failed to delete course' },
    { status: result.status && result.status >= 400 ? result.status : 502 },
  );
}
