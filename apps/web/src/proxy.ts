import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get('better-auth.session_token');
  const isAuthPage =
    request.nextUrl.pathname.startsWith('/sign-in') ||
    request.nextUrl.pathname.startsWith('/sign-up');

  if (!sessionToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
