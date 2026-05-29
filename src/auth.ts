// src/auth.ts
// NextAuth v5 — Session manager chính của ứng dụng
// Dùng httpOnly cookie (bảo mật hơn localStorage)
// Tích hợp Supabase Auth cho email/password
// Hỗ trợ Google + GitHub OAuth (bật khi có credentials)

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin client (service role) — dùng server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const config = {
  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    // Chỉ bật khi có credentials (không crash app nếu chưa có)
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),

    // ── GitHub OAuth ──────────────────────────────────────────────────────────
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
          }),
        ]
      : []),

    // ── Email / Password ──────────────────────────────────────────────────────
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email hoặc Username", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          console.log("[AUTH] Starting authorize for:", credentials.email);
          // Dùng anon client để đăng nhập (không dùng admin)
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );

          let email = credentials.email as string;

          // Hỗ trợ đăng nhập bằng username
          if (!email.includes("@")) {
            console.log("[AUTH] Looking up username:", email);
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("email")
              .eq("username", email.toLowerCase())
              .single();

            if (!profile?.email) {
              console.log("[AUTH] Username not found in profiles");
              return null;
            }
            email = profile.email;
          }

          console.log("[AUTH] Attempting Supabase signInWithPassword for:", email);
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: credentials.password as string,
          });

          if (error || !data.user) {
            console.error("[AUTH] Supabase Auth Error:", error?.message);
            return null;
          }

          console.log("[AUTH] Supabase signIn SUCCESS, fetching profile");
          // Lấy thêm thông tin profile
          const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id, username, name, avatar_url")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
             console.log("[AUTH] Profile lookup warning:", profileError.message);
          }

          const userObj = {
            id: data.user.id,
            email: data.user.email!,
            name:
              profile?.name ||
              data.user.user_metadata?.username ||
              email.split("@")[0],
            image:
              profile?.avatar_url ||
              data.user.user_metadata?.avatar_url ||
              null,
            username:
              profile?.username ||
              data.user.user_metadata?.username ||
              email.split("@")[0],
          };
          console.log("[AUTH] Returning userObj:", userObj);
          return userObj;
        } catch (err) {
          console.error("[AUTH] Credentials auth catch block error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // ── Xử lý OAuth Login (Google/GitHub) ───────────────────────────────────
    async signIn({ user, account }) {
      if (
        account?.provider === "google" ||
        account?.provider === "github"
      ) {
        try {
          // Kiểm tra nếu user đã có profile
          const { data: existing } = await supabaseAdmin
            .from("profiles")
            .select("id, username")
            .eq("email", user.email!)
            .single();

          if (!existing) {
            // Tạo Supabase Auth user cho OAuth user
            const { data: authData, error } =
              await supabaseAdmin.auth.admin.createUser({
                email: user.email!,
                email_confirm: true,
                user_metadata: {
                  name: user.name,
                  avatar_url: user.image,
                  username: user.email!.split("@")[0],
                  provider: account.provider,
                },
              });

            if (!error && authData.user) {
              user.id = authData.user.id;
              const baseUsername = user.email!.split("@")[0].toLowerCase();
              // Đảm bảo username là unique
              const username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
              await supabaseAdmin.from("profiles").upsert({
                id: authData.user.id,
                email: user.email,
                username,
                name: user.name,
                avatar_url: user.image,
              });
              (user as any).username = username;
            }
          } else {
            user.id = existing.id;
            (user as any).username = existing.username;
          }
        } catch (err) {
          console.error("OAuth signIn error:", err);
        }
      }
      return true;
    },

    // ── JWT: Lưu thông tin vào cookie ────────────────────────────────────────
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.username = (user as any).username;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.username) token.username = session.username;
        if (session.image) token.picture = session.image;
      }
      return token;
    },

    // ── Session: Expose thông tin cho client ─────────────────────────────────
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },

  // Bắt buộc cho Next.js deployment
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);
