import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getEssaysByUserId, createEssay } from "@/lib/db/essays"
import { incrementProgress } from "@/lib/db/progress"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const userId = session.user.id as string

    const essays = await getEssaysByUserId(userId, limit)

    return NextResponse.json(essays)
  } catch (error) {
    console.error("Error fetching essays:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, content, correctedContent, score, feedback } = await request.json()

    const result = await createEssay({
      title,
      content,
      correctedContent,
      score,
      feedback,
      userId: session.user.id as string,
      isFlagged: false,
    })

    // Update user progress
    await incrementProgress(session.user.id as string, "essaysCompleted")

    return NextResponse.json(
      {
        _id: result.insertedId,
        title,
        content,
        correctedContent,
        score,
        feedback,
        userId: session.user.id,
        isFlagged: false,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating essay:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

