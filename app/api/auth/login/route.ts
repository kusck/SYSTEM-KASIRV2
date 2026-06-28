import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'pasundan_pos_auth';

function authToken() {
  return process.env.POS_AUTH_TOKEN || process.env.AUTH_SECRET || 'pasundan-pos-local-token';
}

function loginPassword() {
  return process.env.POS_LOGIN_PASSWORD || 'admin123';
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || '');

  if (password !== loginPassword()) {
    return NextResponse.json({ message: 'Password salah' }, { status: 401 });
  }

  const res = NextResponse.json({ message: 'Login berhasil' });
  res.cookies.set(AUTH_COOKIE, authToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
