import { refineText } from "@/lib/ielts/public";
import { InstructionName, getInstructions } from "@/lib/ielts/instructions";
import { selectVocabularyForLearning } from "@/lib/ielts/vocabularySelector";
import { NextResponse } from "next/server";
import type { IELTSFeedback } from "@/lib/types/ielts";

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

  // Parse the refined feedback to add vocabulary selection
  try {
    const ieltsFeedback: IELTSFeedback = JSON.parse(refined);

    // Select vocabulary for learning (runs in parallel with response)
    const selectedVocabulary = await selectVocabularyForLearning(ieltsFeedback, level);

    // Add selected vocabulary to feedback
    ieltsFeedback.selectedVocabulary = selectedVocabulary;

    console.log(`Selected ${selectedVocabulary.length} vocabulary items for essay: ${ieltsFeedback.topic}`);

    // Return the enhanced feedback
    return NextResponse.json({ text, refined: JSON.stringify(ieltsFeedback) });
  } catch (error) {
    console.error("Error adding vocabulary selection:", error);
    // If vocabulary selection fails, return original feedback
    return NextResponse.json({ text, refined: refined });
  }
}
