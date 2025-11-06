import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "teacher")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const client = await clientPromise
    const db = client.db()

    const query: any = {}
    if (type) {
      query.type = type
    }

    const assignments = await db.collection("assignments").find(query).limit(limit).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "teacher")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, prompt, dueDate, instructions, type } = await request.json()

    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    const result = await db.collection("assignments").insertOne({
      title,
      prompt,
      dueDate: dueDate ? new Date(dueDate) : null,
      instructions,
      type,
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json(
      {
        _id: result.insertedId,
        title,
        prompt,
        dueDate,
        instructions,
        type,
        createdBy: session.user.id,
        createdAt: now,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

