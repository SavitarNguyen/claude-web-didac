"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"

// Helper function to validate and convert user ID
function validateUserId(userId: string): string | null {
  // Check if it's already a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(userId)) {
    return userId
  }
  
  // If it's a Google OAuth ID (numeric), return null to use default values
  if (/^\d+$/.test(userId)) {
    console.warn("Google OAuth user ID detected, using default progress values")
    return null
  }
  
  return null
}

export async function getUserProgress() {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and has an ID
    if (!session?.user || !(session.user as any).id) {
      return {
        wordsLearned: 0,
        essaysCompleted: 0,
        speakingCompleted: 0,
        studyTimeMinutes: 0,
        streak: 0,
        lastStudyDate: new Date(),
      }
    }

    // Validate user ID
    const validUserId = validateUserId((session.user as any).id)
    
    if (!validUserId) {
      // Return default values for Google OAuth users or invalid IDs
      return {
        wordsLearned: 0,
        essaysCompleted: 0,
        speakingCompleted: 0,
        studyTimeMinutes: 0,
        streak: 0,
        lastStudyDate: new Date(),
      }
    }

    const supabase = createServerClient()

    const { data, error } = await supabase.from("progress").select("*").eq("user_id", validUserId).single()

    if (error || !data) {
      console.error("Error fetching progress:", error)
      return {
        wordsLearned: 0,
        essaysCompleted: 0,
        speakingCompleted: 0,
        studyTimeMinutes: 0,
        streak: 0,
        lastStudyDate: new Date(),
      }
    }

    return {
      wordsLearned: data.words_learned || 0,
      essaysCompleted: data.essays_completed || 0,
      speakingCompleted: data.speaking_completed || 0,
      studyTimeMinutes: data.study_time_minutes || 0,
      streak: data.streak || 0,
      lastStudyDate: new Date(data.last_study_date) || new Date(),
    }
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return {
      wordsLearned: 0,
      essaysCompleted: 0,
      speakingCompleted: 0,
      studyTimeMinutes: 0,
      streak: 0,
      lastStudyDate: new Date(),
    }
  }
}

export async function getRecentActivity() {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and has an ID
    if (!session?.user || !(session.user as any).id) {
      return []
    }

    // Validate user ID
    const validUserId = validateUserId((session.user as any).id)
    
    if (!validUserId) {
      // Return empty array for Google OAuth users or invalid IDs
      return []
    }

    // This would be a real database query in production
    // For now, we'll return mock data
    return [
      {
        type: "flashcard",
        title: "Completed 'Advanced Adjectives' flashcard set",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        action: "Review",
        url: "/flashcards",
      },
      {
        type: "essay",
        title: "Submitted essay: 'The Impact of Technology'",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        action: "View",
        url: "/essay",
      },
      {
        type: "speaking",
        title: "Completed speaking practice: 'Pronunciation Basics'",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        action: "Practice",
        url: "/speaking",
      },
    ]
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}

