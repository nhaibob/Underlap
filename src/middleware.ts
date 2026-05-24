// src/middleware.ts
// Bảo vệ routes server-side — dùng NextAuth
// Người chưa đăng nhập sẽ bị redirect về /login

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Routes yêu cầu đăng nhập
  const protectedRoutes = [
    "/feed",
    "/profile",
    "/messages",
    "/notifications",
    "/explore",
    "/tactic/edit",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Routes chỉ dành cho người chưa đăng nhập
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Chưa đăng nhập → redirect về login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập → không cần ở trang login/register nữa
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/feed", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Áp dụng cho tất cả routes trừ static files và API
    "/((?!api|_next/static|_next/image|favicon.ico|assets|logo).*)",
  ],
};
