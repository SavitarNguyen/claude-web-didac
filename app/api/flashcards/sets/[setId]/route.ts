import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { setId: string } }) {
  try {
    const { setId } = params

    if (!setId) {
      return NextResponse.json({ error: "ID or slug is required" }, { status: 400 })
    }

    console.log(`Fetching flashcard set with ID or slug: ${setId}`)

    const supabase = createServerClient()

    // Try to get the set by slug first
    let { data: set, error: slugError } = await supabase.from("flashcard_sets").select("*").eq("slug", setId).single()

    // If not found by slug, try by ID
    if (slugError && slugError.code === "PGRST116") {
      console.log(`Set not found by slug, trying by ID: ${setId}`)

      const { data: setById, error: idError } = await supabase
        .from("flashcard_sets")
        .select("*")
        .eq("id", setId)
        .single()

      if (idError) {
        console.error(`Error fetching flashcard set with ID ${setId}:`, idError)
        return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 })
      }

      set = setById
    } else if (slugError) {
      console.error(`Error fetching flashcard set with slug ${setId}:`, slugError)
      return NextResponse.json({ error: slugError.message }, { status: 500 })
    }

    if (!set) {
      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 })
    }

    console.log(`Found set: ${set.title}`)

    // Get all flashcards in the set
    const { data: flashcards, error: flashcardsError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("set_id", set.id)

    if (flashcardsError) {
      console.error(`Error fetching flashcards for set ${set.id}:`, flashcardsError)
      return NextResponse.json({ error: flashcardsError.message }, { status: 500 })
    }

    return NextResponse.json({
      ...set,
      flashcards,
    })
  } catch (error) {
    console.error("Error in GET /api/flashcards/sets/[setId]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

