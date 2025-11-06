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

    const { title, content } = await request.json()

    // In a real app, this would call Deepseek AI for analysis
    // For now, we'll simulate AI feedback
    const score = Math.floor(Math.random() * 30) + 70 // Random score between 70-100

    const feedback = {
      grammar: [
        "Good use of complex sentences",
        "Watch for subject-verb agreement in paragraph 3",
        "Consider using more varied punctuation",
      ],
      vocabulary: [
        "Strong vocabulary choices overall",
        "Consider replacing 'good' with more specific adjectives",
        "The word 'utilize' is used repeatedly - try alternatives",
      ],
      structure: [
        "Clear introduction and conclusion",
        "Paragraph transitions could be smoother",
        "Main argument is well-supported with evidence",
      ],
      suggestions: [
        "Expand on your third point with an additional example",
        "Consider addressing potential counterarguments",
        "The conclusion could more strongly tie back to your thesis",
      ],
    }

    const result = await createEssay({
      title,
      content,
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

