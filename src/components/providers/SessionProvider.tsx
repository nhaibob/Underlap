"use client";
// src/components/providers/SessionProvider.tsx
// Bọc ứng dụng bằng NextAuth SessionProvider
// Cho phép dùng useSession() hook trong toàn bộ client components

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
  );
}
