import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';
import { WORKSPACE_PERMITTED_ROLES } from '@/lib/roles';

type ProtectedPrefix = '/dinas' | '/petugas' | '/admin';

function protectedWorkspace(pathname: string): ProtectedPrefix | null {
  if (pathname === '/dinas' || pathname.startsWith('/api/dinas/')) return '/dinas';
  if (pathname === '/petugas' || pathname.startsWith('/api/petugas/')) return '/petugas';
  if (pathname === '/admin' || pathname.startsWith('/api/admin/')) return '/admin';
  return null;
}

export async function middleware(request: NextRequest) {
  const workspace = protectedWorkspace(request.nextUrl.pathname);
  if (!workspace) return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const allowedRoles = WORKSPACE_PERMITTED_ROLES[workspace];
  const isAllowed = Boolean(session && allowedRoles.includes(session.role));

  if (isAllowed) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Akses ditolak. Workspace ini tidak tersedia untuk peran akun Anda.' },
      { status: session ? 403 : 401 },
    );
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  loginUrl.searchParams.set('error', session ? 'forbidden' : 'unauthorized');
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/dinas',
    '/dinas/:path*',
    '/petugas',
    '/petugas/:path*',
    '/admin',
    '/admin/:path*',
    '/api/dinas/:path*',
    '/api/petugas/:path*',
    '/api/admin/:path*',
  ],
};
