import { createClient } from "@supabase/supabase-js"

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    throw new Error("Missing Supabase environment variables")
  }

  console.log("Creating Supabase client with URL:", supabaseUrl)

  // Use service role key for server-side operations to bypass RLS when needed
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Server-side clients don't need session persistence
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
  })
}

