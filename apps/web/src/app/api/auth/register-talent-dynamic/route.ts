import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { basicInfo, categoryIds, attributes } = data;

    const { fullName, email, password } = basicInfo || {};

    if (!fullName || !email || !password) {
      return NextResponse.json({ message: 'Missing basic fields' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    // Step 1: Register user via NestJS backend
    const registerRes = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fullName,
        email,
        password,
        role: 'TALENT',
      }),
    });

    const registerData = await registerRes.json();

    if (!registerRes.ok) {
      return NextResponse.json(
        { message: registerData.message || 'Registration failed' },
        { status: registerRes.status },
      );
    }

    const userId = registerData?.data?.user?.id;

    // Step 2: If user was created, register the talent profile
    if (userId) {
      try {
        await fetch(`${apiUrl}/talent/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${registerData?.data?.accessToken || ''}`,
          },
          body: JSON.stringify({
            userId,
            categoryIds,
            attributes,
          }),
        });
      } catch (e) {
        console.error('Failed to create talent profile:', e);
      }
    }

    return NextResponse.json({
      success: true,
      user: registerData?.data?.user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
