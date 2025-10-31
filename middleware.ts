import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Check for access token in localStorage (but since middleware runs on server, we need to check cookies or headers)
  // Actually, for localStorage, we can't access it in middleware. We need to use cookies or redirect to login if no token.

  // For simplicity, since using localStorage, we'll handle auth in client-side, but middleware can redirect if no token in cookies.
  // But user specified localStorage, so perhaps set a cookie for middleware.

  // To make it work, we'll assume we set a cookie 'auth-token' when logged in.

  const token = request.cookies.get('auth-token')?.value

  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
