// src/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
    // Credentials provider for email/password login
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Import supabase dynamically to avoid module issues
        const { supabaseAuth } = await import("@/lib/supabase");
        
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          
          // Try to sign in with Supabase
          const { user } = await supabaseAuth.signIn(
            credentials.email as string,
            credentials.password as string
          );
          
          if (user) {
            return {
              id: user.id,
              name: user.user_metadata?.name || user.user_metadata?.username || user.email?.split('@')[0],
              email: user.email,
              image: user.user_metadata?.avatar_url || '/assets/avatars/default.png'
            };
          }
          
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          // Fallback to demo user for development
          if (credentials?.email === "demo@underlap.com" && credentials?.password === "demo123") {
            return {
              id: "demo-user-id",
              name: "Demo User",
              email: "demo@underlap.com",
              image: "/assets/avatars/default.png"
            };
          }
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    // signOut: "/logout",
    // error: "/error",
    // newUser: "/register"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  }
})
