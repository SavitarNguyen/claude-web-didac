"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

export async function getFlashcardSets() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const supabase = createServerClient()

    // Get all public sets and user's own sets
    const { data, error } = await supabase
      .from("flashcard_sets")
      .select(`
        *,
        flashcards:flashcards(count)
      `)
      .or(`is_public.eq.true,created_by.eq.${session.user.id}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching flashcard sets:", error)
      throw new Error("Failed to fetch flashcard sets")
    }

    // Process the data to get card count
    return data.map((set) => ({
      ...set,
      card_count: Array.isArray(set.flashcards) ? set.flashcards.length : 0,
    }))
  } catch (error) {
    console.error("Error in getFlashcardSets:", error)
    throw error
  }
}

export async function createFlashcardSet(data: {
  title: string
  description?: string
  category?: string
  tags?: string[]
  isPublic?: boolean
}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const supabase = createServerClient()

    const setId = uuidv4()
    const now = new Date().toISOString()

    const { error } = await supabase.from("flashcard_sets").insert({
      id: setId,
      title: data.title,
      description: data.description || "",
      category: data.category || "",
      tags: data.tags || [],
      is_public: data.isPublic || false,
      created_by: session.user.id,
      created_at: now,
      updated_at: now,
    })

    if (error) {
      console.error("Error creating flashcard set:", error)
      throw new Error("Failed to create flashcard set")
    }

    return { id: setId }
  } catch (error) {
    console.error("Error in createFlashcardSet:", error)
    throw error
  }
}

export async function getFlashcardsBySetId(setId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const supabase = createServerClient()

    // Get the flashcards
    const { data: flashcards, error: flashcardsError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("set_id", setId)
      .order("created_at", { ascending: true })

    if (flashcardsError) {
      console.error("Error fetching flashcards:", flashcardsError)
      throw new Error("Failed to fetch flashcards")
    }

    // Get the user's progress for these flashcards
    const { data: progress, error: progressError } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .in(
        "flashcard_id",
        flashcards.map((card) => card.id),
      )

    if (progressError) {
      console.error("Error fetching flashcard progress:", progressError)
      // Continue anyway, just won't have progress data
    }

    // Combine flashcards with progress data
    const progressMap = new Map()
    if (progress) {
      progress.forEach((p) => progressMap.set(p.flashcard_id, p))
    }

    return flashcards.map((card) => ({
      ...card,
      progress: progressMap.get(card.id) || {
        status: "new",
        review_count: 0,
      },
    }))
  } catch (error) {
    console.error("Error in getFlashcardsBySetId:", error)
    throw error
  }
}

export async function createFlashcard(data: {
  setId: string
  word: string
  definition: string
  example?: string
  imageUrl?: string
  tags?: string[]
}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const supabase = createServerClient()

    const cardId = uuidv4()
    const now = new Date().toISOString()

    const { error } = await supabase.from("flashcards").insert({
      id: cardId,
      set_id: data.setId,
      word: data.word,
      definition: data.definition,
      example: data.example || "",
      image_url: data.imageUrl || "",
      tags: data.tags || [],
      user_id: session.user.id,
      is_learned: false,
      needs_review: false,
      created_at: now,
      updated_at: now,
    })

    if (error) {
      console.error("Error creating flashcard:", error)
      throw new Error("Failed to create flashcard")
    }

    return { id: cardId }
  } catch (error) {
    console.error("Error in createFlashcard:", error)
    throw error
  }
}

export async function updateFlashcardProgress(flashcardId: string, status: "new" | "learning" | "known" | "difficult") {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const supabase = createServerClient()
    const now = new Date()

    // Calculate next review date based on status and spaced repetition algorithm
    const nextReviewDate = new Date()
    switch (status) {
      case "new":
        nextReviewDate.setMinutes(now.getMinutes() + 10) // Review in 10 minutes
        break
      case "learning":
        nextReviewDate.setHours(now.getHours() + 1) // Review in 1 hour
        break
      case "known":
        nextReviewDate.setDate(now.getDate() + 3) // Review in 3 days
        break
      case "difficult":
        nextReviewDate.setHours(now.getHours() + 6) // Review in 6 hours
        break
    }

    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("flashcard_id", flashcardId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking flashcard progress:", checkError)
      throw new Error("Failed to check flashcard progress")
    }

    if (existingProgress) {
      // Update existing progress
      const { error: updateError } = await supabase
        .from("flashcard_progress")
        .update({
          status,
          next_review_date: nextReviewDate.toISOString(),
          review_count: existingProgress.review_count + 1,
          last_reviewed_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", existingProgress.id)

      if (updateError) {
        console.error("Error updating flashcard progress:", updateError)
        throw new Error("Failed to update flashcard progress")
      }
    } else {
      // Create new progress record
      const { error: insertError } = await supabase.from("flashcard_progress").insert({
        user_id: session.user.id,
        flashcard_id: flashcardId,
        status,
        next_review_date: nextReviewDate.toISOString(),
        review_count: 1,
        last_reviewed_at: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })

      if (insertError) {
        console.error("Error creating flashcard progress:", insertError)
        throw new Error("Failed to create flashcard progress")
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateFlashcardProgress:", error)
    throw error
  }
}

