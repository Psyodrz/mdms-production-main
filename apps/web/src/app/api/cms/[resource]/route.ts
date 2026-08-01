import { NextRequest, NextResponse } from 'next/server';
import { getResource } from '@/lib/cms/resources';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ resource: string }> };

// Server-side fallback store for resources when backend API returns 404
const fallbackStore: Record<string, any[]> = {};

export async function GET(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });

  // Forward pagination params so the backend returns the requested page instead
  // of silently capping at the default page size.
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  if (page) qs.set('page', page);
  if (limit) qs.set('limit', limit);
  const listPath = qs.toString() ? `${cfg.backend.list}?${qs.toString()}` : cfg.backend.list;

  const result = await backendFetch(listPath);

  if (result.ok && result.data) {
    const payload = result.data as any;
    const paginated = !Array.isArray(payload) && payload && Array.isArray(payload.data);
    const list = Array.isArray(payload) ? payload : paginated ? payload.data : [];

    if (Array.isArray(list)) {
      if (list.length > 0) fallbackStore[resource] = list;
      return NextResponse.json({
        ok: true,
        status: 200,
        data: list,
        ...(paginated
          ? { total: payload.total, page: payload.page, totalPages: payload.totalPages }
          : {}),
      });
    }
  }

  // Fallback to sample data if backend endpoint is 404 or empty
  if (!fallbackStore[resource]) {
    fallbackStore[resource] = (cfg.sample as any[]) || [];
  }

  return NextResponse.json({ ok: true, status: 200, data: fallbackStore[resource] });
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

  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  // Never fake success: surface the real backend error and status so the UI can
  // show an accurate message instead of a phantom row that vanishes on reload.
  return NextResponse.json(
    { ok: false, error: result.error || 'Failed to create item' },
    { status: result.status && result.status >= 400 ? result.status : 502 },
  );
}
