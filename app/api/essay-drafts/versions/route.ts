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

    const { searchParams } = new URL(request.url)
    const draftId = searchParams.get("draft_id")

    if (!draftId) {
      return NextResponse.json({ error: "Draft ID is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get all versions for this draft (including the original and all descendants)
    const { data: versions, error } = await supabase
      .from("essay_drafts")
      .select("*")
      .eq("user_id", session.user.id)
      .or(`id.eq.${draftId},parent_draft_id.eq.${draftId}`)
      .order("version", { ascending: false })

    if (error) {
      console.error("Error fetching draft versions:", error)
      return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 })
    }

    return NextResponse.json(versions)
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

    const { version_id } = await request.json()

    if (!version_id) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get the version to revert to
    const { data: version, error: versionError } = await supabase
      .from("essay_drafts")
      .select("*")
      .eq("id", version_id)
      .eq("user_id", session.user.id)
      .single()

    if (versionError || !version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    // Mark all versions in this chain as not current
    const rootId = version.parent_draft_id || version.id
    await supabase
      .from("essay_drafts")
      .update({ is_current: false })
      .eq("user_id", session.user.id)
      .or(`id.eq.${rootId},parent_draft_id.eq.${rootId}`)

    // Mark the selected version as current
    const { data: updatedVersion, error: updateError } = await supabase
      .from("essay_drafts")
      .update({ is_current: true })
      .eq("id", version_id)
      .select()
      .single()

    if (updateError) {
      console.error("Error reverting to version:", updateError)
      return NextResponse.json({ error: "Failed to revert version" }, { status: 500 })
    }

    return NextResponse.json(updatedVersion)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
