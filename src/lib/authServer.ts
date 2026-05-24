// src/lib/authServer.ts
// Server-side auth helper — dùng NextAuth auth() thay vì Bearer token
// Session được đọc từ httpOnly cookie (bảo mật hơn)

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Admin client cho DB operations (bypass RLS khi cần)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

/**
 * Lấy thông tin user từ NextAuth session (httpOnly cookie).
 * Không cần request object — NextAuth tự đọc cookie.
 * Returns null nếu chưa đăng nhập.
 */
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    return {
      id: session.user.id,
      email: session.user.email || "",
      username:
        (session.user as any).username ||
        session.user.email?.split("@")[0] ||
        "",
    };
  } catch {
    return null;
  }
}

/**
 * Yêu cầu đăng nhập — trả về user hoặc throw 401 response.
 * Dùng trong API routes bắt buộc phải có user.
 */
export async function requireServerUser(): Promise<AuthUser> {
  const user = await getServerUser();
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
