// src/middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Protected routes - require authentication
  const protectedRoutes = ["/feed", "/profile", "/community", "/explore"]
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Auth routes - redirect to feed if already logged in
  const authRoutes = ["/login", "/register"]
  const isAuthRoute = authRoutes.includes(pathname)

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to feed if accessing auth routes while logged in
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/feed", req.nextUrl.origin))
  }

  return NextResponse.next()
})

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)"
  ]
}
