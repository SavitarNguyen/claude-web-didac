import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json({
      message: "API is working",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in test API:", error)
    return NextResponse.json({ error: "Test API error" }, { status: 500 })
  }
}

