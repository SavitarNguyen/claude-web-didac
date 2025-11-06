import { createServerClient } from "./supabase-server"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const supabase = createServerClient()

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error || !data.user) {
          return null
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0],
          image: data.user.user_metadata?.avatar_url,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const supabase = createServerClient()

        // Check if user exists in Supabase
        const { data: existingUser } = await supabase.from("users").select("*").eq("email", user.email!).single()

        if (!existingUser) {
          // Create user in Supabase
          const { error } = await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            provider: "google",
          })

          if (error) {
            console.error("Error creating user in Supabase:", error)
            return false
          }

          // Create initial progress record
          await supabase.from("progress").insert({
            user_id: user.id,
            words_learned: 0,
            essays_completed: 0,
            speaking_completed: 0,
            study_time_minutes: 0,
            last_study_date: new Date().toISOString(),
            streak: 0,
          })
        }
      }

      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

