import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { API_URL } from '@/lib/api-client';

const ROLES = ['GUEST', 'CLIENT', 'TALENT', 'EDITOR', 'EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

export async function POST(req: Request) {
  const session = await auth();
  const actorRole = (session as any)?.user?.role;
  const token = (session as any)?.accessToken;

  if (!session || !token) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (actorRole !== 'SUPER_ADMIN' && actorRole !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, email, password } = body;
  const role = String(body.role || '').toUpperCase();

  if (!name || !email || !password || !ROLES.includes(role)) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid fields (name, email, password, role).' }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
  }
  // Only SUPER_ADMIN may create elevated roles.
  if (actorRole !== 'SUPER_ADMIN' && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
    return NextResponse.json({ ok: false, error: 'Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN accounts.' }, { status: 403 });
  }

  const [firstName, ...rest] = String(name).trim().split(' ');
  const lastName = rest.join(' ');

  // 1. Create the Supabase Auth user (so they can log in).
  let authUserId: string;
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role: role.toLowerCase() },
    });
    if (error || !data?.user) {
      return NextResponse.json({ ok: false, error: error?.message || 'Failed to create auth user' }, { status: 400 });
    }
    authUserId = data.user.id;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Auth provider error' }, { status: 500 });
  }

  // 2. Persist the Prisma record with the same id (so it appears immediately).
  try {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: authUserId, email, firstName, lastName, role }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: json?.message || 'Failed to persist user record' }, { status: res.status });
    }
    return NextResponse.json({ ok: true, data: json?.data ?? json });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Backend unreachable' }, { status: 502 });
  }
}
