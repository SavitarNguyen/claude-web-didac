import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

// This is a simplified endpoint with minimal error handling and dependencies
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received data:", body)

    const { setId, word, definition } = body

    if (!setId || !word || !definition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Create a minimal flashcard with only the absolutely required fields
    const flashcardData = {
      id: uuidv4(),
      set_id: setId,
      word: word,
      definition: definition,
    }

    console.log("Inserting flashcard:", flashcardData)

    const { data, error } = await supabase.from("flashcards").insert(flashcardData).select()

    if (error) {
      console.error("Insert error:", error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    // Manually update the card count
    try {
      await supabase.rpc("increment_flashcard_count", { set_id_param: setId })
    } catch (countError) {
      console.error("Error updating count (non-critical):", countError)
    }

    return NextResponse.json({ success: true, flashcard: data[0] })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

