// src/lib/authFetch.ts
// Client-side fetch helper that automatically attaches Supabase auth token
import { supabaseAuth } from "./supabase";

/**
 * Get authorization headers for API calls.
 * Returns { Authorization: Bearer <token> } if user is logged in.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await supabaseAuth.getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Fetch with auth — convenience wrapper that auto-attaches Bearer token.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });
}
