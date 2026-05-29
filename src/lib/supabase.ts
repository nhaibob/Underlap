// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase credentials not found.");
}

export { supabase };

export const isSupabaseConfigured = () => supabase !== null;

// Auth helpers
export const supabaseAuth = {
  // Sign up with email/password and save username to profiles
  signUp: async (email: string, password: string, username: string) => {
    if (!supabase) throw new Error("Supabase not configured");

    // First register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name: username },
      },
    });

    if (error) throw error;
    
    // Supabase auth prevents email enumeration by returning a fake user object if the email already exists
    // We can detect this by checking if the user identities array is empty
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error("Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.");
    }

    // Save username mapping to profiles table
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email,
        username: username.toLowerCase(),
        name: username,
      });
    }

    return data;
  },

  // Sign in with username or email
  signIn: async (usernameOrEmail: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured");

    let email = usernameOrEmail;

    // If it doesn't look like an email, try to find email by username
    if (!usernameOrEmail.includes("@")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", usernameOrEmail.toLowerCase())
        .single();

      if (profile?.email) {
        email = profile.email;
      } else {
        throw new Error("Tên người dùng không tồn tại");
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  getUser: async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const session = await res.json();
        if (session && session.user) {
          // Trả về cấu trúc tương thích với Supabase User để không cần sửa code cũ
          return {
            id: session.user.id,
            email: session.user.email,
            user_metadata: {
              username: session.user.username,
              name: session.user.name,
              avatar_url: session.user.image,
            },
            created_at: new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn("Failed to get NextAuth session:", e);
    }
    return null;
  },

  // Get access token for API calls (Authorization header)
  getAccessToken: async (): Promise<string | null> => {
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  },

  // Send password reset email
  resetPassword: async (email: string) => {
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  // Update password (called after user clicks reset link)
  updatePassword: async (newPassword: string) => {
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },
};
