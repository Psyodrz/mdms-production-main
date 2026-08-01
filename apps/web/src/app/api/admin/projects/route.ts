import { NextRequest, NextResponse } from 'next/server';
import { backendFetchRaw } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

/**
 * Session-authenticated BFF for the admin Projects list. Mirrors the CMS
 * transport (NextAuth session + service account) so it works regardless of
 * whether the admin has a Supabase browser token — fixes the direct-to-backend
 * 401 on /super-admin/cms/projects.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams();
  for (const key of ['page', 'limit', 'status', 'search']) {
    const v = searchParams.get(key);
    if (v) qs.set(key, v);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const r = await backendFetchRaw(`/admin/projects${suffix}`);

  if (!r.ok) {
    return NextResponse.json(
      { success: false, error: r.error || 'Failed to load projects' },
      { status: r.status && r.status >= 400 ? r.status : 502 },
    );
  }
  const env = r.json ?? {};
  return NextResponse.json({
    success: true,
    data: env.data ?? [],
    total: env.total ?? 0,
    page: env.page ?? 1,
    totalPages: env.totalPages ?? 1,
  });
}
