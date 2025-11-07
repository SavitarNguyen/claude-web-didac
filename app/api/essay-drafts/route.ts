import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const currentOnly = searchParams.get("current_only") === "true"

    let query = supabase
      .from("essay_drafts")
      .select(`
        *,
        essay_topics (
          id,
          name
        ),
        essay_prompts (
          id,
          title
        )
      `)
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })

    if (currentOnly) {
      query = query.eq("is_current", true)
    }

    const { data: drafts, error } = await query

    if (error) {
      console.error("Error fetching drafts:", error)
      return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
    }

    return NextResponse.json(drafts)
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

    const { topic_id, prompt_id, title, content, parent_draft_id } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // If this is a new version, get the parent draft to determine version number
    let version = 1
    if (parent_draft_id) {
      const { data: parentDraft } = await supabase
        .from("essay_drafts")
        .select("version")
        .eq("id", parent_draft_id)
        .single()

      if (parentDraft) {
        version = parentDraft.version + 1

        // Mark all previous versions as not current
        await supabase
          .from("essay_drafts")
          .update({ is_current: false })
          .eq("user_id", session.user.id)
          .or(`id.eq.${parent_draft_id},parent_draft_id.eq.${parent_draft_id}`)
      }
    } else {
      // New draft - mark any existing drafts for same prompt as not current
      if (prompt_id) {
        await supabase
          .from("essay_drafts")
          .update({ is_current: false })
          .eq("user_id", session.user.id)
          .eq("prompt_id", prompt_id)
      }
    }

    // Delete old versions if we have more than 5
    if (parent_draft_id) {
      const { data: allVersions } = await supabase
        .from("essay_drafts")
        .select("id, created_at")
        .eq("user_id", session.user.id)
        .or(`id.eq.${parent_draft_id},parent_draft_id.eq.${parent_draft_id}`)
        .order("created_at", { ascending: false })

      if (allVersions && allVersions.length >= 5) {
        const versionsToDelete = allVersions.slice(4).map((v) => v.id)
        await supabase.from("essay_drafts").delete().in("id", versionsToDelete)
      }
    }

    // Create new draft
    const { data, error } = await supabase
      .from("essay_drafts")
      .insert({
        user_id: session.user.id,
        topic_id,
        prompt_id,
        title,
        content,
        version,
        is_current: true,
        parent_draft_id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating draft:", error)
      return NextResponse.json({ error: "Failed to create draft" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
