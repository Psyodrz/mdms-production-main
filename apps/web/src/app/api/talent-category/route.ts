import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/talent-category`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data.data || data);
    }
    return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status });
  } catch (error) {
    console.error('Error fetching talent categories from backend:', error);
    return NextResponse.json({ error: 'Backend unavailable', categories: [] }, { status: 503 });
  }
}
