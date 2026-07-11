import { NextRequest, NextResponse } from 'next/server';
import { getResource } from '@/lib/cms/resources';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });

  const result = await backendFetch(cfg.backend.list);

  // Admin list endpoints may return a paginated envelope ({ data, total, page,
  // totalPages }) or a bare array. Normalize to a bare array so the client can
  // always rely on res.data being the list.
  const payload = result.data as unknown;
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as any).data)
      ? (payload as any).data
      : payload;

  return NextResponse.json({ ...result, data: list }, { status: result.ok ? 200 : result.status });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });
  if (!cfg.canCreate) {
    return NextResponse.json({ ok: false, error: 'Create not allowed' }, { status: 405 });
  }

  const body = await req.json().catch(() => ({}));
  const result = await backendFetch(cfg.backend.base, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
