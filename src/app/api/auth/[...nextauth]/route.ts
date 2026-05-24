// src/app/api/auth/[...nextauth]/route.ts
// NextAuth v5 route handler — xử lý tất cả auth requests
// (login, logout, OAuth callbacks, session checks)

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
