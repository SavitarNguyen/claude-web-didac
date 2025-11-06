import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Check database schema
    const { data: tableInfo, error: tableError } = await supabase
      .from("information_schema.columns")
      .select("table_name, column_name, data_type, is_nullable")
      .in("table_name", ["flashcards", "flashcard_sets"])

    if (tableError) {
      return NextResponse.json(
        {
          message: "Error fetching schema information",
          error: tableError,
        },
        { status: 500 },
      )
    }

    // Check RLS policies
    const { data: policies, error: policiesError } = await supabase.rpc("get_policies_info", {
      table_names: ["flashcards", "flashcard_sets"],
    })

    // Get a sample flashcard set
    const { data: sampleSet, error: setError } = await supabase.from("flashcard_sets").select("*").limit(1).single()

    // Get sample flashcards
    const { data: sampleCards, error: cardsError } = await supabase.from("flashcards").select("*").limit(3)

    // Test creating a flashcard
    const testId = uuidv4()
    const testSetId = sampleSet?.id

    let insertResult = null
    let insertError = null

    if (testSetId) {
      const { data, error } = await supabase
        .from("flashcards")
        .insert({
          id: testId,
          set_id: testSetId,
          word: `Debug Test ${new Date().toISOString()}`,
          definition: "This is a test definition created by the debug endpoint",
          created_at: new Date().toISOString(),
        })
        .select()

      insertResult = data
      insertError = error

      // Clean up the test flashcard
      if (!error) {
        await supabase.from("flashcards").delete().eq("id", testId)
      }
    }

    return NextResponse.json({
      schema: {
        tables: tableInfo,
        policies: policies || "Could not fetch policies",
        policiesError: policiesError,
      },
      samples: {
        set: sampleSet,
        setError: setError,
        cards: sampleCards,
        cardsError: cardsError,
      },
      testInsert: {
        result: insertResult,
        error: insertError,
      },
      session: {
        user: {
          id: (session.user as any).id,
          role: (session.user as any).role,
          email: session.user.email,
        },
      },
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

