// src/components/providers/SessionProvider.tsx
// Simple provider wrapper (NextAuth removed — using Supabase Auth)
"use client";

import { ReactNode } from "react";

export function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
