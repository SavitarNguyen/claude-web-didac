import { generateEssayIdeas } from "@/lib/ielts/geminiIdeasGenerator";
import { NextResponse } from "next/server";

interface RequestJSON {
  essayPrompt: string;
  level: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above';
  userIdeas?: string; // Optional, for Refine mode
}

export async function POST(request: Request) {
  try {
    const body: RequestJSON = await request.json();
    const { essayPrompt, level, userIdeas } = body;

    if (!essayPrompt) {
      return NextResponse.json(
        { error: "Essay prompt is required" },
        { status: 400 }
      );
    }

    if (!level) {
      return NextResponse.json(
        { error: "Student level is required" },
        { status: 400 }
      );
    }

    const generatedIdeas = await generateEssayIdeas(essayPrompt, level, userIdeas);

    return NextResponse.json({
      ideas: generatedIdeas,
      mode: userIdeas ? 'refine' : 'generate'
    });
  } catch (error) {
    console.error("Error generating essay ideas:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Failed to generate ideas: ${errorMessage}` },
      { status: 500 }
    );
  }
}