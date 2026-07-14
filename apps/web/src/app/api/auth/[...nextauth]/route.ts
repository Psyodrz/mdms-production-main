import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('--- NEXTAUTH GET CALLED ---', req.nextUrl.pathname);
  return NextResponse.json({ message: "Supabase Auth is active" });
}

export async function POST(req: NextRequest) {
  console.log('--- NEXTAUTH POST CALLED ---', req.nextUrl.pathname);
  return NextResponse.json({ message: "Supabase Auth is active" });
}
