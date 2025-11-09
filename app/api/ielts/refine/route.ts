import { refineText } from "@/lib/ielts/public";
import { InstructionName, getInstructions } from "@/lib/ielts/instructions";
import { NextResponse } from "next/server";

interface RequestJSON {
  text?: string;
  instructionNames: InstructionName[];
  level?: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above'; // Student proficiency level
}

export async function POST(request: Request) {
  const body: RequestJSON = await request.json();
  const { text, instructionNames, level } = body;

  if (!text) {
    return NextResponse.json({ error: "No text provided" });
  }

  const instructions = getInstructions(instructionNames);

  // Use non-streaming mode
  const refined = await refineText(text, instructions, undefined, level);
  return NextResponse.json({ text, refined: refined });
}
