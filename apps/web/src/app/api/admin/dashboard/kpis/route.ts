import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

/**
 * BFF proxy for the admin dashboard KPI widget. The browser must never call the
 * NestJS API directly (it can't hold a backend-issued JWT), so this route
 * authenticates server-side with the CMS service token and forwards the result.
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const result = await backendFetch('/admin/dashboard/kpis');
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
