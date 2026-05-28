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
import jwt from "jsonwebtoken";


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
          // Dùng anon client để đăng nhập (không dùng admin)
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );

          let email = credentials.email as string;

          // Hỗ trợ đăng nhập bằng username
          if (!email.includes("@")) {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("email")
              .eq("username", email.toLowerCase())
              .single();

            if (!profile?.email) return null;
            email = profile.email;
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: credentials.password as string,
          });

          if (error || !data.user) return null;

          // Lấy thêm thông tin profile
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id, username, name, avatar_url")
            .eq("id", data.user.id)
            .single();

          return {
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
        } catch (err) {
          console.error("Credentials auth error:", err);
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.username = (user as any).username;
      }
      
      // Tạo token Supabase từ secret để gởi kèm request client
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (secret && token.id) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(new Date(token.exp as number || Date.now() / 1000 + 30 * 24 * 60 * 60).getTime() / 1000), // Default exp or nextauth's exp
          sub: token.id as string,
          email: token.email,
          role: "authenticated",
        };
        token.supabaseAccessToken = jwt.sign(payload, secret);
      }

      return token;
    },

    // ── Session: Expose thông tin cho client ─────────────────────────────────
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session as any).supabaseAccessToken = token.supabaseAccessToken;
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
