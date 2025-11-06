import { createServerClient } from "../supabase-server"

export interface SpeakingPractice {
  id?: string
  audioUrl: string
  transcript?: string
  score?: number
  feedback?: any
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export async function getSpeakingPracticesByUserId(userId: string, limit = 10) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("speaking_practices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching speaking practices:", error)
    return []
  }

  // Convert Supabase format to MongoDB format for compatibility
  return data.map((practice) => ({
    _id: practice.id,
    audioUrl: practice.audio_url,
    transcript: practice.transcript,
    score: practice.score,
    feedback: practice.feedback,
    userId: practice.user_id,
    createdAt: new Date(practice.created_at),
    updatedAt: new Date(practice.updated_at),
  }))
}

export async function getSpeakingPracticeById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("speaking_practices").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching speaking practice:", error)
    return null
  }

  // Convert Supabase format to MongoDB format for compatibility
  return {
    _id: data.id,
    audioUrl: data.audio_url,
    transcript: data.transcript,
    score: data.score,
    feedback: data.feedback,
    userId: data.user_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createSpeakingPractice(practiceData: Omit<SpeakingPractice, "id" | "createdAt" | "updatedAt">) {
  const supabase = createServerClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("speaking_practices")
    .insert({
      audio_url: practiceData.audioUrl,
      transcript: practiceData.transcript,
      score: practiceData.score,
      feedback: practiceData.feedback,
      user_id: practiceData.userId,
      created_at: now,
      updated_at: now,
    })
    .select()

  if (error) {
    console.error("Error creating speaking practice:", error)
    throw error
  }

  return {
    insertedId: data[0].id,
  }
}

