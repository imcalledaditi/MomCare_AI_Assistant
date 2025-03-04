import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth_token') // Use your actual cookie name
  const path = request.nextUrl.pathname
  
  // If user is on login page but is already logged in, redirect to dashboard
  if (path === '/login' && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If user is trying to access protected routes without auth, redirect to login
  if (path.startsWith('/dashboard') && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/appointments/:path*', '/medicaldocuments/:path*'],
}