import { NextRequest, NextResponse } from 'next/server';

const TEAM_PASSWORD = process.env.TEAM_PASSWORD || 'nixo2024';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === TEAM_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('nixo-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('nixo-auth');

  if (authCookie?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('nixo-auth');
  return response;
}
