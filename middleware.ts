// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = [
    '/medicaldocuments',
    '/emergency',
    '/resources',
    '/appointments',
    '/chat',
    '/dashboard',
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If it's a protected route
  if (isProtectedRoute) {
    // Check for the Appwrite session cookie
    const hasSession = request.cookies.get('a_session')?.value;

    // If no session cookie is found, redirect to login
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Continue with the request if authenticated or not a protected route
  return NextResponse.next();
}

// Apply middleware to all routes except public ones
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|login|signup).*)',
  ],
};
