import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getProgressByUserId, updateStudyStreak } from "@/lib/db/progress"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id as string

    const progress = await getProgressByUserId(userId)

    if (!progress) {
      return NextResponse.json({ message: "Progress not found" }, { status: 404 })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { studyTimeMinutes } = await request.json()
    const userId = (session.user as any).id as string

    // Update progress and streak
    const updatedProgress = await updateStudyStreak(userId, studyTimeMinutes)

    if (!updatedProgress) {
      return NextResponse.json({ message: "Progress not found" }, { status: 404 })
    }

    // Get the updated progress
    const progress = await getProgressByUserId(userId)

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

