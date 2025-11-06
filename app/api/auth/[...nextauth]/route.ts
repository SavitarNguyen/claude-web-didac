import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createServerClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Add authorization params to request the right scopes
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
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

        // Get user from Supabase
        const { data: user, error } = await supabase.from("users").select("*").eq("email", credentials.email).single()

        if (error || !user || !user.password) {
          console.error("User lookup error:", error || "User not found or no password")
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          console.error("Password validation failed")
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log("SignIn callback triggered:", { user: user.email, provider: account?.provider })
        
        // If the user signed in with Google, check if they exist in our database
        if (account?.provider === "google") {
          const supabase = createServerClient()

          console.log("Checking for existing user with email:", user.email)

          const { data: existingUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single()

          if (error && error.code === "PGRST116") {
            // User doesn't exist, create a new one
            console.log("Creating new user for Google sign-in")
            
            const userId = uuidv4()
            const now = new Date().toISOString()
            
            const { error: insertError, data: newUser } = await supabase
              .from("users")
              .insert({
                id: userId,
                name: user.name,
                email: user.email,
                image: user.image,
                role: "student", // Default role for new users
                created_at: now,
                updated_at: now,
              })
              .select()

            if (insertError) {
              console.error("Error creating user:", insertError)
              return false
            }

            console.log("Successfully created new user:", newUser[0])

            // Create initial progress record
            try {
              await supabase.from("progress").insert({
                user_id: userId,
                words_learned: 0,
                essays_completed: 0,
                speaking_completed: 0,
                study_time_minutes: 0,
                last_study_date: now,
                streak: 0,
                created_at: now,
                updated_at: now,
              })
              console.log("Created initial progress record")
            } catch (progressError) {
              console.error("Error creating progress record:", progressError)
              // Don't fail the sign-in for progress record errors
            }
          } else if (error) {
            console.error("Error checking existing user:", error)
            return false
          } else {
            console.log("Existing user found:", existingUser)
            // Update the user object with the database ID
            user.id = existingUser.id
          }
        }
        
        console.log("SignIn callback completed successfully")
        return true
      } catch (error) {
        console.error("Sign in error:", error)
        return false
      }
    },
    async jwt({ token, user, account }: { token: any; user: any; account?: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      
      // If this is a Google sign-in, ensure we have the user data
      if (account?.provider === "google" && user) {
        console.log("JWT callback for Google user:", user.email)
      }
      
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl })
      // Ensure we redirect to the homepage after authentication
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

