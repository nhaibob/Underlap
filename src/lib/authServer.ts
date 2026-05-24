// src/lib/authServer.ts
// Server-side auth helper — validates Supabase access token from Authorization header
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Admin client for DB operations (bypasses RLS when needed)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

/**
 * Extract and validate the user from the Authorization header.
 * Client sends: Authorization: Bearer <supabase_access_token>
 * Server validates the token with Supabase and returns user info.
 * Returns null if no valid token.
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7); // Remove "Bearer "
    if (!token) return null;

    // Validate token with Supabase Auth
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      username: user.user_metadata?.username || user.email?.split("@")[0],
    };
  } catch (error) {
    console.error("Auth validation error:", error);
    return null;
  }
}

/**
 * Require authentication — returns user or throws 401 response.
 * Use in API routes that MUST have a logged-in user.
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
