import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Admin password MUST be set in production environment
    if (!adminPassword) {
      return NextResponse.json({
        authenticated: false,
        message: 'Admin password not configured. Please set ADMIN_PASSWORD in environment variables.',
      }, { status: 500 });
    }

    if (password === adminPassword) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 400 });
  }
}
