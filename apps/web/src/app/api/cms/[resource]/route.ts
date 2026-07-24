import { NextRequest, NextResponse } from 'next/server';
import { getResource } from '@/lib/cms/resources';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ resource: string }> };

// Server-side fallback store for resources when backend API returns 404
const fallbackStore: Record<string, any[]> = {};

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });

  const result = await backendFetch(cfg.backend.list);

  if (result.ok && result.data) {
    const payload = result.data as unknown;
    const list = Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && Array.isArray((payload as any).data)
        ? (payload as any).data
        : payload;

    if (Array.isArray(list) && list.length > 0) {
      fallbackStore[resource] = list;
      return NextResponse.json({ ok: true, status: 200, data: list });
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

  // Update fallback store if backend endpoint is unavailable
  if (!fallbackStore[resource]) {
    fallbackStore[resource] = (cfg.sample as any[]) || [];
  }
  const newItem = { id: body.id || body.slug || `custom-${Date.now()}`, ...body };
  fallbackStore[resource] = [newItem, ...fallbackStore[resource]];

  return NextResponse.json({ ok: true, status: 200, data: newItem });
}
