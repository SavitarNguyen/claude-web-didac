import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ezflkuxwglxqpmdredhs.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veWt1Y3BsdHN4ZnJhZWZxYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTMxOTksImV4cCI6MjA1NzE2OTE5OX0.CKuIandkPzG1oicDYt6IhqjBr0dtO_vO0x-SHpCZ5ew"

export const supabase = createClient(supabaseUrl, supabaseKey)

