import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate essay ideas using Gemini AI with CTA, TCA, CBA frameworks
 * @param essayPrompt - The IELTS essay question/prompt
 * @param level - Student's current band level
 * @param userIdeas - Optional user's brief ideas (for Refine mode)
 * @returns Generated essay ideas in structured format
 */
export async function generateEssayIdeas(
  essayPrompt: string,
  level: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above',
  userIdeas?: string
): Promise<string> {
  const refineMode = !!userIdeas;

  const prompt = `You are an IELTS essay brainstorming assistant. Generate structured essay ideas using these reasoning frameworks:

**CTA (Characteristic-Based Argument):**
- When to use: Explaining behaviors, trends, or phenomena due to inherent human traits
- How it works: Connect topic to human nature, innate needs, or natural tendencies
- Key elements: Human nature → innate need → modern manifestation

**TCA (Time-Based Contrast Argument):**
- When to use: Showing how something has changed over time (past vs. present)
- How it works: Contrast past situations with current reality to show cause-effect
- Key elements: Past situation → Present change → Consequence

**CBA (Context-Based Argument):**
- When to use: Making ideas realistic, local, or relatable with real-life situations
- How it works: Add specific cultural or local context (especially Vietnamese context)
- Key elements: Specific context (location/culture) → Common practice → Impact

---

**Student Level**: ${getLevelText(level)}
**Essay Topic**: "${essayPrompt}"
${refineMode ? `**Student's Brief Ideas**: "${userIdeas}"\n` : ''}
---

Generate structured essay ideas following this EXACT format:

**Introduction**
[1–2 sentences: paraphrase the question + give a direct thesis]
**Vietnamese translation**: [translation here]

---

**Body Paragraph 1**

**Topic sentence**: [one clear main point]

**Idea 1:**
A ⇒ B ⇒ C ⇒ D (optional)
- **A (Main idea)**: [≤15 words]
- **B (Reason/Mechanism)**: [≤15 words]
- **C (Evidence/Example/Comparison)**: [≤15 words]
- **D (Effect/Implication, optional)**: [≤15 words]
- **Vietnamese translation**: [translation of A ⇒ B ⇒ C ⇒ D]

**Idea 2** (optional if relevant):
A2 ⇒ B2 ⇒ C2 ⇒ D2 (optional)
- **A2 (Main idea)**: [≤15 words]
- **B2 (Reason/Mechanism)**: [≤15 words]
- **C2 (Evidence/Example/Comparison)**: [≤15 words]
- **D2 (Effect/Implication, optional)**: [≤15 words]
- **Vietnamese translation**: [translation of A2 ⇒ B2 ⇒ C2 ⇒ D2]

---

**Body Paragraph 2**

**Topic sentence**: [second clear main point]

**Idea 1:**
A ⇒ B ⇒ C ⇒ D (optional)
- **A (Main idea)**: [≤15 words]
- **B (Reason/Mechanism)**: [≤15 words]
- **C (Evidence/Example/Comparison)**: [≤15 words]
- **D (Effect/Implication, optional)**: [≤15 words]
- **Vietnamese translation**: [translation of A ⇒ B ⇒ C ⇒ D]

**Idea 2** (optional if relevant):
A2 ⇒ B2 ⇒ C2 ⇒ D2 (optional)
- **A2 (Main idea)**: [≤15 words]
- **B2 (Reason/Mechanism)**: [≤15 words]
- **C2 (Evidence/Example/Comparison)**: [≤15 words]
- **D2 (Effect/Implication, optional)**: [≤15 words]
- **Vietnamese translation**: [translation of A2 ⇒ B2 ⇒ C2 ⇒ D2]

---

**CRITICAL CONSTRAINTS:**

1. **NO hooks** - Introduction = paraphrase + thesis ONLY (no general opening sentence)
2. **NO conclusion** - Unless explicitly requested by student
3. **Each A/B/C/D line ≤ 15 words** - Be concise and clear
4. **Use topic-relevant, realistic examples** - Vietnamese context is highly encouraged and appropriate
5. **Match student's band level**:
   - Band 5.0 or below: Use basic vocabulary and simple grammar
   - Band 5.5-6.5: Use natural, common academic vocabulary (Band 6-7 level)
   - Band 7.0+: Use sophisticated but natural vocabulary
6. **Apply CTA/TCA/CBA frameworks** - Choose the most appropriate framework(s) for each idea to strengthen reasoning
7. **Output ONLY the structure above** - No extra commentary, explanations, or meta-text

${refineMode ? `\n**IMPORTANT**: Incorporate and improve the student's initial ideas above while maintaining this structure. Use CTA/TCA/CBA to strengthen their reasoning and add depth.\n` : ''}`;

  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please set it in your environment variables.");
    }

    const geminiModel = genAI.getGenerativeModel({ model });

    const result = await geminiModel.generateContent([prompt]);
    const response = await result.response;
    const generatedIdeas = response.text();

    return generatedIdeas;
  } catch (error) {
    console.error("Gemini Ideas Generator API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to generate essay ideas with Gemini API: ${errorMessage}`);
  }
}

function getLevelText(level: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above'): string {
  switch (level) {
    case '5.0_or_below':
      return 'Band 5.0 or below (Beginner)';
    case '5.5_to_6.5':
      return 'Band 5.5-6.5 (Intermediate)';
    case '7.0_or_above':
      return 'Band 7.0 or above (Advanced)';
    default:
      return 'Band 5.5-6.5 (Intermediate)';
  }
}
