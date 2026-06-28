import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'pasundan_pos_auth';

function authToken() {
  return process.env.POS_AUTH_TOKEN || process.env.AUTH_SECRET || 'pasundan-pos-local-token';
}

function isPublicPath(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/offline.html' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/')
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/api/cashbook/reset' && req.method === 'GET') {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) return NextResponse.next();

  const loggedIn = req.cookies.get(AUTH_COOKIE)?.value === authToken();

  if (loggedIn) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ message: 'Sesi login diperlukan' }, { status: 401 });
  }

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!.*\\..*).*)', '/api/:path*'],
};
