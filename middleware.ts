// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/appointments", "/chat"];

export function middleware(request: NextRequest) {
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const isAuthenticated = request.cookies.get("auth_session");

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/appointments/:path*", "/chat/:path*"],
};
