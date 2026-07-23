import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mp-backend-api.onrender.com/api/v1';
    const accessToken = (session as any).accessToken;

    const res = await fetch(`${apiUrl}/talent/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Submit profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit profile' },
      { status: 500 }
    );
  }
}
