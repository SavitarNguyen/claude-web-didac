import { createServerClient } from "../supabase-server"

export interface Progress {
  id?: string
  userId: string
  wordsLearned: number
  essaysCompleted: number
  speakingCompleted: number
  studyTimeMinutes: number
  lastStudyDate: Date
  streak: number
  createdAt?: Date
  updatedAt?: Date
}

export async function getProgressByUserId(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("progress").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching progress:", error)
    return null
  }

  // Convert Supabase format to MongoDB format for compatibility
  return {
    _id: data.id,
    userId: data.user_id,
    wordsLearned: data.words_learned,
    essaysCompleted: data.essays_completed,
    speakingCompleted: data.speaking_completed,
    studyTimeMinutes: data.study_time_minutes,
    lastStudyDate: new Date(data.last_study_date),
    streak: data.streak,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function updateProgress(userId: string, progressData: Partial<Progress>) {
  const supabase = createServerClient()

  const updates: any = {
    updated_at: new Date().toISOString(),
  }

  if (progressData.wordsLearned !== undefined) updates.words_learned = progressData.wordsLearned
  if (progressData.essaysCompleted !== undefined) updates.essays_completed = progressData.essaysCompleted
  if (progressData.speakingCompleted !== undefined) updates.speaking_completed = progressData.speakingCompleted
  if (progressData.studyTimeMinutes !== undefined) updates.study_time_minutes = progressData.studyTimeMinutes
  if (progressData.lastStudyDate) updates.last_study_date = progressData.lastStudyDate.toISOString()
  if (progressData.streak !== undefined) updates.streak = progressData.streak

  const { error } = await supabase.from("progress").update(updates).eq("user_id", userId)

  if (error) {
    console.error("Error updating progress:", error)
    throw error
  }

  return { modifiedCount: 1 }
}

export async function incrementProgress(userId: string, field: string, amount = 1) {
  const supabase = createServerClient()

  // First get the current progress
  const { data, error: fetchError } = await supabase.from("progress").select("*").eq("user_id", userId).single()

  if (fetchError) {
    console.error("Error fetching progress:", fetchError)
    return { modifiedCount: 0 }
  }

  // Map MongoDB field names to Supabase field names
  const fieldMap: Record<string, string> = {
    wordsLearned: "words_learned",
    essaysCompleted: "essays_completed",
    speakingCompleted: "speaking_completed",
    studyTimeMinutes: "study_time_minutes",
  }

  const supabaseField = fieldMap[field] || field

  // Calculate the new value
  const currentValue = data[supabaseField] || 0
  const newValue = currentValue + amount

  // Update the progress
  const { error: updateError } = await supabase
    .from("progress")
    .update({
      [supabaseField]: newValue,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("Error incrementing progress:", updateError)
    return { modifiedCount: 0 }
  }

  return { modifiedCount: 1 }
}

export async function updateStudyStreak(userId: string, studyTimeMinutes: number) {
  const supabase = createServerClient()

  // Get current progress
  const { data: progress, error: fetchError } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (fetchError) {
    console.error("Error fetching progress:", fetchError)
    return null
  }

  // Check if last study date was today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastStudyDate = new Date(progress.last_study_date)
  lastStudyDate.setHours(0, 0, 0, 0)

  // Calculate streak
  let streak = progress.streak

  if (today.getTime() > lastStudyDate.getTime()) {
    // If last study was yesterday, increment streak
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (lastStudyDate.getTime() === yesterday.getTime()) {
      streak += 1
    } else {
      // If last study was not yesterday, reset streak
      streak = 1
    }
  }

  // Update progress
  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from("progress")
    .update({
      study_time_minutes: progress.study_time_minutes + studyTimeMinutes,
      last_study_date: now,
      streak: streak,
      updated_at: now,
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("Error updating study streak:", updateError)
    return null
  }

  // Return the updated progress in MongoDB format for compatibility
  return {
    _id: progress.id,
    userId: progress.user_id,
    wordsLearned: progress.words_learned,
    essaysCompleted: progress.essays_completed,
    speakingCompleted: progress.speaking_completed,
    studyTimeMinutes: progress.study_time_minutes + studyTimeMinutes,
    lastStudyDate: new Date(now),
    streak: streak,
    createdAt: new Date(progress.created_at),
    updatedAt: new Date(now),
  }
}

