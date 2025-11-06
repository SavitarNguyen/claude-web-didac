"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

interface VocabularyItem {
  word: string
  definition: string
  example?: string
  phonetic?: string
  partOfSpeech?: string
  synonyms?: string[]
  antonyms?: string[]
  notes?: string
}

export async function importVocabulary(content: string, format: "tab" | "dash" | "semicolon" | "newline") {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Check if user is admin
    const supabase = createServerClient()
    const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!user || !["admin", "teacher"].includes(user.role)) {
      throw new Error("Only admins can import vocabulary")
    }

    // Parse content based on format
    let items: VocabularyItem[] = []

    switch (format) {
      case "tab":
        items = content.split("\n").map((line) => {
          const [word, definition, example] = line.split("\t")
          return { word: word.trim(), definition: definition.trim(), example: example?.trim() }
        })
        break

      case "dash":
        items = content.split(";").map((item) => {
          const [word, rest] = item.split("-").map((s) => s.trim())
          const [definition, example] = rest.split("\n").map((s) => s.trim())
          return { word, definition, example }
        })
        break

      case "semicolon":
        items = content.split(";").map((item) => {
          const [word, definition, example] = item.split("\n").map((s) => s.trim())
          return { word, definition, example }
        })
        break

      case "newline":
        const lines = content
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
        items = []
        for (let i = 0; i < lines.length; i += 3) {
          if (i + 1 < lines.length) {
            items.push({
              word: lines[i],
              definition: lines[i + 1],
              example: lines[i + 2],
            })
          }
        }
        break
    }

    // Filter out invalid items
    items = items.filter((item) => item.word && item.definition)

    if (items.length === 0) {
      throw new Error("No valid vocabulary items found")
    }

    // Insert vocabulary items
    const { error } = await supabase.from("vocabulary").insert(
      items.map((item) => ({
        id: uuidv4(),
        ...item,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    )

    if (error) {
      console.error("Error importing vocabulary:", error)
      throw new Error("Failed to import vocabulary")
    }

    return { success: true, count: items.length }
  } catch (error) {
    console.error("Error in importVocabulary:", error)
    throw error
  }
}

export async function createVocabularySet(data: {
  title: string
  description?: string
  category?: string
  tags?: string[]
  isPublic?: boolean
  vocabularyIds: string[]
}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Check if user is admin
    const supabase = createServerClient()
    const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!user || !["admin", "teacher"].includes(user.role)) {
      throw new Error("Only admins can create vocabulary sets")
    }

    const setId = uuidv4()
    const now = new Date().toISOString()

    // Create the set
    const { error: setError } = await supabase.from("vocabulary_sets").insert({
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

    if (setError) {
      console.error("Error creating vocabulary set:", setError)
      throw new Error("Failed to create vocabulary set")
    }

    // Add items to the set
    if (data.vocabularyIds.length > 0) {
      const { error: itemsError } = await supabase.from("vocabulary_set_items").insert(
        data.vocabularyIds.map((vocabId, index) => ({
          id: uuidv4(),
          set_id: setId,
          vocabulary_id: vocabId,
          position: index,
          created_at: now,
        })),
      )

      if (itemsError) {
        console.error("Error adding items to set:", itemsError)
        throw new Error("Failed to add items to set")
      }
    }

    return { id: setId }
  } catch (error) {
    console.error("Error in createVocabularySet:", error)
    throw error
  }
}

export async function updateVocabularyProgress(
  vocabularyId: string,
  status: "new" | "learning" | "known" | "difficult",
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const supabase = createServerClient()
    const now = new Date()

    // Calculate next review date based on status
    const nextReviewAt = new Date()
    switch (status) {
      case "new":
        nextReviewAt.setMinutes(now.getMinutes() + 10) // Review in 10 minutes
        break
      case "learning":
        nextReviewAt.setHours(now.getHours() + 1) // Review in 1 hour
        break
      case "known":
        nextReviewAt.setDate(now.getDate() + 3) // Review in 3 days
        break
      case "difficult":
        nextReviewAt.setHours(now.getHours() + 6) // Review in 6 hours
        break
    }

    // Update or create progress record
    const { data: existing } = await supabase
      .from("user_vocabulary_progress")
      .select("id, review_count")
      .eq("user_id", session.user.id)
      .eq("vocabulary_id", vocabularyId)
      .single()

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("user_vocabulary_progress")
        .update({
          status,
          review_count: existing.review_count + 1,
          last_reviewed_at: now.toISOString(),
          next_review_at: nextReviewAt.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", existing.id)

      if (error) {
        console.error("Error updating progress:", error)
        throw new Error("Failed to update progress")
      }
    } else {
      // Create new record
      const { error } = await supabase.from("user_vocabulary_progress").insert({
        id: uuidv4(),
        user_id: session.user.id,
        vocabulary_id: vocabularyId,
        status,
        review_count: 1,
        last_reviewed_at: now.toISOString(),
        next_review_at: nextReviewAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })

      if (error) {
        console.error("Error creating progress:", error)
        throw new Error("Failed to create progress")
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateVocabularyProgress:", error)
    throw error
  }
}

export async function getVocabularySet(setId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const supabase = createServerClient()

    // Get the set details
    const { data: set, error: setError } = await supabase
      .from("vocabulary_sets")
      .select(`
        *,
        items:vocabulary_set_items(
          position,
          vocabulary:vocabulary(*)
        )
      `)
      .eq("id", setId)
      .single()

    if (setError) {
      console.error("Error fetching vocabulary set:", setError)
      throw new Error("Failed to fetch vocabulary set")
    }

    // Get progress for all vocabulary items in the set
    const vocabularyIds = set.items.map((item) => item.vocabulary.id)
    const { data: progress, error: progressError } = await supabase
      .from("user_vocabulary_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .in("vocabulary_id", vocabularyIds)

    if (progressError) {
      console.error("Error fetching progress:", progressError)
      // Continue anyway, just won't have progress data
    }

    // Combine vocabulary items with progress data
    const progressMap = new Map()
    if (progress) {
      progress.forEach((p) => progressMap.set(p.vocabulary_id, p))
    }

    const items = set.items
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        ...item.vocabulary,
        progress: progressMap.get(item.vocabulary.id) || {
          status: "new",
          review_count: 0,
        },
      }))

    return {
      ...set,
      items,
    }
  } catch (error) {
    console.error("Error in getVocabularySet:", error)
    throw error
  }
}

