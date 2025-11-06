import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Allow non-authenticated users to use the chat
    // but we could restrict it if needed

    const { messages, context } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Format messages for Deepseek API
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add system message with context if provided
    if (context) {
      formattedMessages.unshift({
        role: "system",
        content: `You are a helpful vocabulary assistant. The user is currently studying flashcards. 
                 Here's some context about what they're learning: ${context}
                 Be friendly, concise, and helpful. Use simple language and provide examples when appropriate.`,
      })
    } else {
      formattedMessages.unshift({
        role: "system",
        content: `You are a helpful vocabulary assistant. Be friendly, concise, and helpful.
                 Use simple language and provide examples when appropriate.`,
      })
    }

    // Call Deepseek API
    const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: formattedMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json()
      console.error("Deepseek API error:", errorData)

      // Fallback response if Deepseek API fails
      return NextResponse.json({
        response: "I'm having trouble connecting to my brain right now. Please try again in a moment!",
      })
    }

    const data = await deepseekResponse.json()
    const response = data.choices[0].message.content

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

