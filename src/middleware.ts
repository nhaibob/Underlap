// src/middleware.ts
// Middleware disabled - using Supabase Auth client-side instead
// To re-enable NextAuth middleware, uncomment the code below

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Currently allowing all routes - Supabase Auth is handled client-side
  // Protected routes can check for session in their components
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)"
  ]
}

/* 
// To enable NextAuth middleware protection, replace the above with:
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const protectedRoutes = ["/feed", "/profile", "/community", "/explore"]
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  const authRoutes = ["/login", "/register"]
  const isAuthRoute = authRoutes.includes(pathname)

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/feed", req.nextUrl.origin))
  }

  return NextResponse.next()
})
*/
