import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get("topic_id")

    let query = supabase
      .from("essay_prompts")
      .select(`
        *,
        essay_topics (
          id,
          name
        )
      `)
      .order("title", { ascending: true })

    if (topicId) {
      query = query.eq("topic_id", topicId)
    }

    const { data: prompts, error } = await query

    if (error) {
      console.error("Error fetching essay prompts:", error)
      return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
    }

    return NextResponse.json(prompts)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
    }

    const { topic_id, title, description } = await request.json()

    if (!topic_id || !title) {
      return NextResponse.json({ error: "Topic ID and title are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("essay_prompts")
      .insert({
        topic_id,
        title,
        description,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating prompt:", error)
      return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
