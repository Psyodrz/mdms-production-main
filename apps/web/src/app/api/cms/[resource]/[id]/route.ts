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

  // upsert resources persist updates through the same POST endpoint; patch
  // resources use PATCH base/:id.
  const result =
    cfg.backend.updateMode === 'upsert'
      ? await backendFetch(cfg.backend.base, { method: 'POST', body: JSON.stringify(body) })
      : await backendFetch(`${cfg.backend.base}/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });

  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
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
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
