import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const supabase = createServerClient()
    const { data: user } = await supabase.from("users").select("role").eq("id", (session.user as any).id).single()

    if (!user || !["admin", "teacher"].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("role", "student")
      .order("name", { ascending: true })

    if (studentsError) {
      console.error("Error fetching students:", studentsError)
      return NextResponse.json({ message: "Failed to fetch students" }, { status: 500 })
    }

    // Get progress for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        // Get progress
        const { data: progress, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", student.id)
          .single()

        if (progressError && progressError.code !== "PGRST116") {
          console.error(`Error fetching progress for student ${student.id}:`, progressError)
        }

        // Get vocabulary progress stats
        const { data: vocabStats, error: vocabError } = await supabase
          .from("user_vocabulary_progress")
          .select("status, count")
          .eq("user_id", student.id)
          .group("status")

        if (vocabError) {
          console.error(`Error fetching vocabulary stats for student ${student.id}:`, vocabError)
        }

        // Get recent activity
        const { data: essays, error: essaysError } = await supabase
          .from("essays")
          .select("title, created_at, score")
          .eq("user_id", student.id)
          .order("created_at", { ascending: false })
          .limit(3)

        if (essaysError) {
          console.error(`Error fetching essays for student ${student.id}:`, essaysError)
        }

        // Get flashcard activity
        const { data: flashcardActivity, error: flashcardError } = await supabase
          .from("user_vocabulary_progress")
          .select("vocabulary_id, status, last_reviewed_at")
          .eq("user_id", student.id)
          .order("last_reviewed_at", { ascending: false })
          .limit(3)

        if (flashcardError) {
          console.error(`Error fetching flashcard activity for student ${student.id}:`, flashcardError)
        }

        // Get vocabulary words for flashcard activity
        let vocabularyWords = {}
        if (flashcardActivity && flashcardActivity.length > 0) {
          const vocabIds = flashcardActivity.map((item) => item.vocabulary_id)
          const { data: vocabData, error: vocabError } = await supabase
            .from("vocabulary")
            .select("id, word")
            .in("id", vocabIds)

          if (vocabError) {
            console.error(`Error fetching vocabulary words for student ${student.id}:`, vocabError)
          } else if (vocabData) {
            vocabularyWords = vocabData.reduce((acc, item) => {
              acc[item.id] = item.word
              return acc
            }, {})
          }
        }

        // Combine all activity
        const recentActivity = [
          ...(essays || []).map((essay) => ({
            type: "essay",
            description: `Wrote essay: "${essay.title}"`,
            status: essay.score ? "completed" : "pending",
            date: essay.created_at,
          })),
          ...(flashcardActivity || []).map((activity) => ({
            type: "flashcard",
            description: `Studied flashcard: "${vocabularyWords[activity.vocabulary_id] || "Unknown word"}"`,
            status: "completed",
            date: activity.last_reviewed_at,
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)

        return {
          ...student,
          progress: progress || {
            words_learned: 0,
            essays_completed: 0,
            speaking_completed: 0,
            study_time_minutes: 0,
            streak: 0,
            last_study_date: new Date().toISOString(),
          },
          vocabularyStats: vocabStats || [],
          recentActivity,
        }
      }),
    )

    return NextResponse.json(studentsWithProgress)
  } catch (error) {
    console.error("Error in GET /api/admin/students:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

