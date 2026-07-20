import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  const queryParams = new URLSearchParams({ page, limit });
  if (search) queryParams.set('search', search);
  if (role) queryParams.set('role', role);

  const result = await backendFetch(`/admin/users?${queryParams.toString()}`);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  const rawData: any = result.data;
  // NestJS response envelope wrapped with ResponseInterceptor: { success, data, total, page, totalPages }
  const usersList = Array.isArray(rawData?.data) ? rawData.data : Array.isArray(rawData) ? rawData : [];
  const total = rawData?.total ?? usersList.length;
  const totalPages = rawData?.totalPages ?? 1;

  return NextResponse.json({
    ok: true,
    data: usersList,
    total,
    page: Number(page),
    totalPages,
  });
}
