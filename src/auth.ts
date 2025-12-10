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
        // TODO: Replace with actual database validation
        // This is a demo - in production, validate against your database
        if (credentials?.email && credentials?.password) {
          // Demo user for testing
          if (credentials.email === "demo@underlap.com" && credentials.password === "demo123") {
            return {
              id: "1",
              name: "Demo User",
              email: "demo@underlap.com",
              image: "/assets/avatars/huyson.png"
            }
          }
        }
        return null
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
