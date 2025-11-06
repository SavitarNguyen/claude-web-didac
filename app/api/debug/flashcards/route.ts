import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || ((session.user as any).role !== "admin" && (session.user as any).role !== "teacher")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get database schema information
    const { data: tableInfo, error: tableError } = await supabase
      .from("information_schema.columns")
      .select("table_name, column_name, data_type, is_nullable")
      .eq("table_name", "flashcards")

    if (tableError) {
      console.error("Error fetching table schema:", tableError)
    }

    // Get all flashcard sets
    const { data: sets, error: setsError } = await supabase.from("flashcard_sets").select("*")

    if (setsError) {
      console.error("Error fetching flashcard sets:", setsError)
    }

    // Get all flashcards
    const { data: flashcards, error: flashcardsError } = await supabase.from("flashcards").select("*").limit(100)

    if (flashcardsError) {
      console.error("Error fetching flashcards:", flashcardsError)
    }

    return NextResponse.json({
      schema: {
        flashcards: tableInfo || [],
      },
      data: {
        sets: sets || [],
        flashcards: flashcards || [],
      },
      errors: {
        schema: tableError ? tableError.message : null,
        sets: setsError ? setsError.message : null,
        flashcards: flashcardsError ? flashcardsError.message : null,
      },
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

