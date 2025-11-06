import { createServerClient } from "../supabase-server"

export interface Flashcard {
  id?: string
  word: string
  definition: string
  example?: string
  imageUrl?: string
  category: string
  tags: string[]
  userId: string
  isLearned: boolean
  needsReview: boolean
  createdAt?: Date
  updatedAt?: Date
}

export async function getFlashcardsByUserId(userId: string, category?: string | null, limit = 50) {
  const supabase = createServerClient()

  let query = supabase.from("flashcards").select("*").eq("user_id", userId)

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit)

  if (error) {
    console.error("Error fetching flashcards:", error)
    return []
  }

  // Convert Supabase format to MongoDB format for compatibility
  return data.map((flashcard) => ({
    _id: flashcard.id,
    word: flashcard.word,
    definition: flashcard.definition,
    example: flashcard.example,
    imageUrl: flashcard.image_url,
    category: flashcard.category,
    tags: flashcard.tags,
    userId: flashcard.user_id,
    isLearned: flashcard.is_learned,
    needsReview: flashcard.needs_review,
    createdAt: new Date(flashcard.created_at),
    updatedAt: new Date(flashcard.updated_at),
  }))
}

export async function getFlashcardById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("flashcards").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching flashcard:", error)
    return null
  }

  // Convert Supabase format to MongoDB format for compatibility
  return {
    _id: data.id,
    word: data.word,
    definition: data.definition,
    example: data.example,
    imageUrl: data.image_url,
    category: data.category,
    tags: data.tags,
    userId: data.user_id,
    isLearned: data.is_learned,
    needsReview: data.needs_review,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createFlashcard(flashcardData: Omit<Flashcard, "id" | "createdAt" | "updatedAt">) {
  const supabase = createServerClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("flashcards")
    .insert({
      word: flashcardData.word,
      definition: flashcardData.definition,
      example: flashcardData.example,
      image_url: flashcardData.imageUrl,
      category: flashcardData.category,
      tags: flashcardData.tags,
      user_id: flashcardData.userId,
      is_learned: flashcardData.isLearned,
      needs_review: flashcardData.needsReview,
      created_at: now,
      updated_at: now,
    })
    .select()

  if (error) {
    console.error("Error creating flashcard:", error)
    throw error
  }

  return {
    insertedId: data[0].id,
  }
}

export async function updateFlashcard(id: string, flashcardData: Partial<Flashcard>) {
  const supabase = createServerClient()

  const updates: any = {
    updated_at: new Date().toISOString(),
  }

  if (flashcardData.word) updates.word = flashcardData.word
  if (flashcardData.definition) updates.definition = flashcardData.definition
  if (flashcardData.example !== undefined) updates.example = flashcardData.example
  if (flashcardData.imageUrl !== undefined) updates.image_url = flashcardData.imageUrl
  if (flashcardData.category) updates.category = flashcardData.category
  if (flashcardData.tags) updates.tags = flashcardData.tags
  if (flashcardData.isLearned !== undefined) updates.is_learned = flashcardData.isLearned
  if (flashcardData.needsReview !== undefined) updates.needs_review = flashcardData.needsReview

  const { error } = await supabase.from("flashcards").update(updates).eq("id", id)

  if (error) {
    console.error("Error updating flashcard:", error)
    throw error
  }

  return { modifiedCount: 1 }
}

export async function deleteFlashcard(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("flashcards").delete().eq("id", id)

  if (error) {
    console.error("Error deleting flashcard:", error)
    throw error
  }

  return { deletedCount: 1 }
}

