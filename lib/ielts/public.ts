import { mockRefineText } from "./mockRefiner";
import { geminiRefineText } from "./geminiRefiner";
import { Instruction } from "./instructions";

const defaultRefiner = "gemini";

export async function refineText(
  text: string,
  instructions: Instruction[],
  languageName?: string,
  level?: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above'
): Promise<string> {
  const refiner = process.env.REFINER ?? defaultRefiner;
  if (refiner === "gemini") {
    return geminiRefineText(text, instructions, languageName, level);
  } else {
    return mockRefineText(text, instructions);
  }
}
