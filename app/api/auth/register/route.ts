import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createServerClient } from "@/lib/supabase-server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing user:", checkError)
      return NextResponse.json({ message: "Database error while checking user" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate UUID for the user
    const userId = crypto.randomUUID()

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: "student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ message: "Failed to create user: " + createError.message }, { status: 500 })
    }

    if (!newUser || newUser.length === 0) {
      return NextResponse.json({ message: "User created but no data returned" }, { status: 500 })
    }

    // Create initial progress record
    const { error: progressError } = await supabase.from("progress").insert({
      user_id: newUser[0].id,
      words_learned: 0,
      essays_completed: 0,
      speaking_completed: 0,
      study_time_minutes: 0,
      last_study_date: new Date().toISOString(),
      streak: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (progressError) {
      console.error("Error creating progress record:", progressError)
      // Continue anyway since the user was created
    }

    return NextResponse.json({ message: "User created successfully", userId: newUser[0].id }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Something went wrong: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}

