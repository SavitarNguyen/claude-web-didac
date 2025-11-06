import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    console.log(`Fetching flashcard set with slug: ${slug}`)

    const supabase = createServerClient()

    // Get the set details by slug
    const { data: set, error: setError } = await supabase.from("flashcard_sets").select("*").eq("slug", slug).single()

    if (setError) {
      console.error(`Error fetching flashcard set with slug ${slug}:`, setError)

      // If the set doesn't exist, try to find it by ID (for backward compatibility)
      if (setError.code === "PGRST116") {
        console.log(`Set not found by slug, trying by ID: ${slug}`)

        const { data: setById, error: setByIdError } = await supabase
          .from("flashcard_sets")
          .select("*")
          .eq("id", slug)
          .single()

        if (setByIdError) {
          console.error(`Error fetching flashcard set with ID ${slug}:`, setByIdError)
          return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 })
        }

        if (setById) {
          console.log(`Found set by ID: ${setById.title}`)

          // Get all flashcards in the set
          const { data: flashcards, error: flashcardsError } = await supabase
            .from("flashcards")
            .select("*")
            .eq("set_id", setById.id)

          if (flashcardsError) {
            console.error(`Error fetching flashcards for set ${setById.id}:`, flashcardsError)
            return NextResponse.json({ error: flashcardsError.message }, { status: 500 })
          }

          return NextResponse.json({
            ...setById,
            flashcards,
          })
        }
      }

      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 })
    }

    console.log(`Found set by slug: ${set.title}`)

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
    console.error("Error in GET /api/flashcards/sets/by-slug/[slug]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

