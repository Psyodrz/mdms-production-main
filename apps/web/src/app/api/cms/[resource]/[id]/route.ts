import { NextRequest, NextResponse } from 'next/server';
import { getResource } from '@/lib/cms/resources';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource, id } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });
  if (!cfg.canEdit) {
    return NextResponse.json({ ok: false, error: 'Edit not allowed' }, { status: 405 });
  }

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

  // Never fake success: surface the real backend error and status.
  return NextResponse.json(
    { ok: false, error: result.error || 'Failed to update item' },
    { status: result.status && result.status >= 400 ? result.status : 502 },
  );
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource, id } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });
  if (!cfg.canDelete) {
    return NextResponse.json({ ok: false, error: 'Delete not allowed' }, { status: 405 });
  }

  const result = await backendFetch(`${cfg.backend.base}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  // Never fake success: surface the real backend error and status.
  return NextResponse.json(
    { ok: false, error: result.error || 'Failed to delete item' },
    { status: result.status && result.status >= 400 ? result.status : 502 },
  );
}
