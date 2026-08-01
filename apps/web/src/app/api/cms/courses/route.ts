import { NextRequest, NextResponse } from 'next/server';
import { getResource } from '@/lib/cms/resources';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

/**
 * Explicit BFF handlers for the `courses` resource.
 *
 * The generic `/api/cms/[resource]` dynamic route cannot serve `/api/cms/courses`
 * because the static `courses/` segment (which hosts `[id]/lessons`) shadows it.
 * These handlers mirror the generic resource proxy so course list/create work.
 */

const COURSES = 'courses';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const cfg = getResource(COURSES);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });

  const result = await backendFetch(cfg.backend.list);
  if (result.ok && result.data) {
    const payload = result.data as unknown;
    const list = Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && Array.isArray((payload as any).data)
        ? (payload as any).data
        : payload;
    if (Array.isArray(list)) {
      return NextResponse.json({ ok: true, status: 200, data: list });
    }
  }

  // Read-time demo fallback (clearly flagged as sample data in the UI).
  return NextResponse.json({ ok: true, status: 200, data: (cfg.sample as any[]) || [] });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const cfg = getResource(COURSES);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const result = await backendFetch(cfg.backend.base, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }
  return NextResponse.json(
    { ok: false, error: result.error || 'Failed to create course' },
    { status: result.status && result.status >= 400 ? result.status : 502 },
  );
}
