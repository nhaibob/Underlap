// src/app/api/auth/[...nextauth]/route.ts
// NextAuth removed — using Supabase Auth exclusively
// This file is kept as a placeholder to avoid 404 errors on NextAuth routes

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Auth handled by Supabase" },
    { status: 200 },
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Auth handled by Supabase" },
    { status: 200 },
  );
}
