import { mockRefineText } from "./mockRefiner";
import { geminiRefineText } from "./geminiRefiner";
import { Instruction } from "./instructions";

const defaultRefiner = "gemini";

export async function refineText(
  text: string,
  instructions: Instruction[]
): Promise<string> {
  const refiner = process.env.REFINER ?? defaultRefiner;
  if (refiner === "gemini") {
    return geminiRefineText(text, instructions);
  } else {
    return mockRefineText(text, instructions);
  }
}
