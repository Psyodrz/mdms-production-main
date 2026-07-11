import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, ...extraMetadata } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Register user via Supabase Auth Admin API (bypassing SMTP email verification using email_confirm)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: role.toLowerCase(), // Store lowercase role in metadata to match front-end check expectation if needed, trigger will upper-case it for DB
        ...extraMetadata
      }
    });

    if (error) {
      console.error('Supabase Admin SignUp Error:', error);
      return NextResponse.json(
        { message: error.message || 'Registration failed' },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('Registration API internal error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

