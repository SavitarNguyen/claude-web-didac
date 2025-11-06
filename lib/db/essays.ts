import { createServerClient } from "../supabase-server"

export interface Essay {
  id?: string
  title: string
  content: string
  score?: number
  feedback?: any
  userId: string
  isFlagged: boolean
  createdAt?: Date
  updatedAt?: Date
}

export async function getEssaysByUserId(userId: string, limit = 10) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("essays")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching essays:", error)
    return []
  }

  // Convert Supabase format to MongoDB format for compatibility
  return data.map((essay) => ({
    _id: essay.id,
    title: essay.title,
    content: essay.content,
    score: essay.score,
    feedback: essay.feedback,
    userId: essay.user_id,
    isFlagged: essay.is_flagged,
    createdAt: new Date(essay.created_at),
    updatedAt: new Date(essay.updated_at),
  }))
}

export async function getEssayById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("essays").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching essay:", error)
    return null
  }

  // Convert Supabase format to MongoDB format for compatibility
  return {
    _id: data.id,
    title: data.title,
    content: data.content,
    score: data.score,
    feedback: data.feedback,
    userId: data.user_id,
    isFlagged: data.is_flagged,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createEssay(essayData: Omit<Essay, "id" | "createdAt" | "updatedAt">) {
  const supabase = createServerClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("essays")
    .insert({
      title: essayData.title,
      content: essayData.content,
      score: essayData.score,
      feedback: essayData.feedback,
      user_id: essayData.userId,
      is_flagged: essayData.isFlagged,
      created_at: now,
      updated_at: now,
    })
    .select()

  if (error) {
    console.error("Error creating essay:", error)
    throw error
  }

  return {
    insertedId: data[0].id,
  }
}

export async function updateEssay(id: string, essayData: Partial<Essay>) {
  const supabase = createServerClient()

  const updates: any = {
    updated_at: new Date().toISOString(),
  }

  if (essayData.title) updates.title = essayData.title
  if (essayData.content) updates.content = essayData.content
  if (essayData.score !== undefined) updates.score = essayData.score
  if (essayData.feedback) updates.feedback = essayData.feedback
  if (essayData.isFlagged !== undefined) updates.is_flagged = essayData.isFlagged

  const { error } = await supabase.from("essays").update(updates).eq("id", id)

  if (error) {
    console.error("Error updating essay:", error)
    throw error
  }

  return { modifiedCount: 1 }
}

export async function getFlaggedEssays(limit = 10) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("essays")
    .select("*")
    .eq("is_flagged", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching flagged essays:", error)
    return []
  }

  // Convert Supabase format to MongoDB format for compatibility
  return data.map((essay) => ({
    _id: essay.id,
    title: essay.title,
    content: essay.content,
    score: essay.score,
    feedback: essay.feedback,
    userId: essay.user_id,
    isFlagged: essay.is_flagged,
    createdAt: new Date(essay.created_at),
    updatedAt: new Date(essay.updated_at),
  }))
}

