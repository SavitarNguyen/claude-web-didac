"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"
import crypto from "crypto"

// Simulate IELTS Grading (replace with actual Deepseek API call later)
function simulateIELTSGrading(essay: string) {
  try {
    // Calculate basic metrics
    const wordCount = essay.split(/\s+/).length
    const sentenceCount = essay.split(/[.!?]+/).length
    const avgWordsPerSentence = wordCount / Math.max(1, sentenceCount)

    // Base scores on essay metrics
    const taskScore = Math.min(9, Math.max(5, 6 + wordCount / 100))
    const coherenceScore = Math.min(9, Math.max(5, 6 + sentenceCount / 10))
    const vocabScore = Math.min(9, Math.max(5, 6 + wordCount / 150))
    const grammarScore = Math.min(9, Math.max(5, 6 + avgWordsPerSentence / 10))

    // Calculate overall score (rounded to nearest 0.5)
    const overallScore = Math.round(((taskScore + coherenceScore + vocabScore + grammarScore) / 4) * 2) / 2

    return {
      score: overallScore,
      feedback: {
        taskAchievement: {
          score: Math.round(taskScore * 10) / 10,
          feedback: [
            "Essay addresses the main topic",
            wordCount < 250 ? "Consider writing a longer response (aim for 250-300 words)" : "Good essay length",
            "Support your arguments with more specific examples",
          ],
        },
        coherenceCohesion: {
          score: Math.round(coherenceScore * 10) / 10,
          feedback: [
            sentenceCount < 10 ? "Try to write more sentences to develop your ideas" : "Good paragraph structure",
            "Use transition words to connect your ideas",
            "Ensure each paragraph has a clear main point",
          ],
        },
        vocabulary: {
          score: Math.round(vocabScore * 10) / 10,
          feedback: [
            "Good basic vocabulary usage",
            "Consider using more academic vocabulary",
            "Try to avoid repetition of common words",
          ],
        },
        grammar: {
          score: Math.round(grammarScore * 10) / 10,
          feedback: [
            avgWordsPerSentence < 10 ? "Try using more complex sentence structures" : "Good sentence variety",
            "Watch for subject-verb agreement",
            "Consider using more complex grammatical structures",
          ],
        },
        improvements: [
          "Add more specific examples to support your arguments",
          "Use a wider range of vocabulary",
          "Ensure clear transitions between paragraphs",
        ],
      },
    }
  } catch (error) {
    console.error("Error in simulateIELTSGrading:", error)
    throw new Error("Failed to grade essay")
  }
}

export async function gradeEssay(title: string, content: string) {
  try {
    if (!title?.trim() || !content?.trim()) {
      throw new Error("Title and content are required")
    }

    // Grade the essay using simulated feedback
    const grading = await simulateIELTSGrading(content)

    // Get the session after grading to avoid unnecessary auth checks for guest users
    const session = await getServerSession(authOptions)

    // If user is logged in, save the essay to the database
    if (session?.user?.id) {
      const userId = session.user.id
      const supabase = createServerClient()

      // Generate a UUID for the essay
      const essayId = crypto.randomUUID()

      // Insert essay into Supabase
      const { error: insertError } = await supabase.from("essays").insert({
        id: essayId,
        title,
        content,
        score: grading.score,
        feedback: grading.feedback,
        user_id: userId,
        is_flagged: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error saving essay:", insertError)
        // Return the grading results even if saving fails
        return {
          ...grading,
          saved: false,
          error: "Failed to save essay to database",
        }
      }

      // Update user progress
      try {
        await incrementUserProgress(userId)
      } catch (error) {
        console.error("Error updating progress:", error)
        // Don't throw here, as the essay was graded successfully
      }

      return {
        ...grading,
        saved: true,
      }
    }

    // For guest users, just return the grading results
    return {
      ...grading,
      saved: false,
    }
  } catch (error) {
    console.error("Error in gradeEssay:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to grade essay")
  }
}

// Helper function to increment user progress
async function incrementUserProgress(userId: string) {
  try {
    const supabase = createServerClient()

    // First, check if the user has a progress record
    const { data: existingProgress, error: fetchError } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching progress:", fetchError)
      return
    }

    const now = new Date().toISOString()

    if (!existingProgress) {
      // Create a new progress record if one doesn't exist
      await supabase.from("progress").insert({
        user_id: userId,
        essays_completed: 1,
        words_learned: 0,
        speaking_completed: 0,
        study_time_minutes: 0,
        last_study_date: now,
        streak: 1,
        created_at: now,
        updated_at: now,
      })
    } else {
      // Update the existing progress record
      await supabase
        .from("progress")
        .update({
          essays_completed: (existingProgress.essays_completed || 0) + 1,
          last_study_date: now,
          updated_at: now,
        })
        .eq("user_id", userId)
    }
  } catch (error) {
    console.error("Error incrementing progress:", error)
    // Don't throw here to avoid breaking the main flow
  }
}

