import { createServerClient } from "@/lib/supabase-server"

/**
 * Updates the card count for a flashcard set
 */
export async function updateFlashcardSetCount(setId: string) {
  try {
    const supabase = createServerClient()

    // Get the current count
    const { count, error: countError } = await supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("set_id", setId)

    if (countError) {
      console.error("Error counting flashcards:", countError)
      return { success: false, error: countError }
    }

    // Update the set with the correct count
    const { data, error } = await supabase.from("flashcard_sets").update({ card_count: count }).eq("id", setId).select()

    if (error) {
      console.error("Error updating flashcard set count:", error)
      return { success: false, error }
    }

    return { success: true, count, data }
  } catch (error) {
    console.error("Error in updateFlashcardSetCount:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Creates a flashcard with minimal required fields
 */
export async function createFlashcard(setId: string, word: string, definition: string, example?: string) {
  try {
    const supabase = createServerClient()

    // Check if the set exists
    const { data: set, error: setError } = await supabase.from("flashcard_sets").select("id").eq("id", setId).single()

    if (setError) {
      console.error("Error checking flashcard set:", setError)
      return { success: false, error: setError }
    }

    // Create the flashcard with minimal fields
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        set_id: setId,
        word,
        definition,
        example: example || null,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating flashcard:", error)
      return { success: false, error }
    }

    // Update the card count (as a backup in case triggers don't work)
    await updateFlashcardSetCount(setId)

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Error in createFlashcard:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Gets all flashcard sets with their card counts
 */
export async function getFlashcardSets() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("flashcard_sets")
      .select("id, title, description, slug, card_count, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching flashcard sets:", error)
      return { success: false, error }
    }

    // Update any missing card counts
    for (const set of data) {
      if (set.card_count === null || set.card_count === undefined) {
        const result = await updateFlashcardSetCount(set.id)
        if (result.success) {
          set.card_count = result.count
        }
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getFlashcardSets:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

