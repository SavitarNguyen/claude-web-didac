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

[1–2 sentences: paraphrase the question + give a direct thesis. NO hooks, NO general opening.]

Vietnamese translation: [Vietnamese translation here]

---

**Body Paragraph 1**

Topic sentence: [one clear main point]

**Idea 1:**

[A] ⇒ [B] ⇒ [C] ⇒ [D]

Vietnamese translation: [A tiếng Việt] ⇒ [B tiếng Việt] ⇒ [C tiếng Việt] ⇒ [D tiếng Việt]

**Idea 2** (optional if relevant):

[A] ⇒ [B] ⇒ [C] ⇒ [D]

Vietnamese translation: [A tiếng Việt] ⇒ [B tiếng Việt] ⇒ [C tiếng Việt] ⇒ [D tiếng Việt]

---

**Body Paragraph 2**

Topic sentence: [second clear main point]

**Idea 1:**

[A] ⇒ [B] ⇒ [C] ⇒ [D]

Vietnamese translation: [A tiếng Việt] ⇒ [B tiếng Việt] ⇒ [C tiếng Việt] ⇒ [D tiếng Việt]

**Idea 2** (optional if relevant):

[A] ⇒ [B] ⇒ [C] ⇒ [D]

Vietnamese translation: [A tiếng Việt] ⇒ [B tiếng Việt] ⇒ [C tiếng Việt] ⇒ [D tiếng Việt]

---

**CRITICAL CONSTRAINTS:**

1. **NO hooks** - Introduction = paraphrase + thesis ONLY (no general opening sentence)
2. **NO conclusion** - Unless explicitly requested by student
3. **Each segment (A, B, C, D) should be concise phrases (≤15 words each)**
4. **Use topic-relevant, realistic examples** - Vietnamese context is highly encouraged and appropriate
5. **Apply CTA/TCA/CBA frameworks** - Choose the most appropriate framework(s) for each idea to strengthen reasoning

**VOCABULARY GUIDELINES BY BAND LEVEL:**

${getVocabularyGuidelines(level)}

6. **Format Requirements - VERY IMPORTANT**:
   - Present each idea as: [short phrase A] ⇒ [short phrase B] ⇒ [short phrase C] ⇒ [short phrase D]
   - Example: "innate desire to learn and improve lives ⇒ free education removes financial barriers ⇒ broader access for people from diverse backgrounds to higher studies ⇒ more educated workforce and greater social mobility"
   - DO NOT use labels like "A (Main idea):", "B (Reason):" in the output
   - DO NOT break into bullet points
   - Each A/B/C/D should be a SHORT PHRASE (not a full sentence)
   - Connect with ⇒ arrows in a single flowing line

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

function getVocabularyGuidelines(level: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above'): string {
  switch (level) {
    case '5.0_or_below':
      return `**Band 5.0 or below - USE BASIC VOCABULARY ONLY:**
- ✅ Use: important, help, use, make, people, problem, solution, good, bad, easy, difficult, money, work, study, learn, teach, student, family, friend, country, government
- ❌ Avoid: crucial, facilitate, utilize, engender, individuals, dilemma, remedy, beneficial, detrimental, contemporary, substantial
- Keep grammar SIMPLE: basic present/past tense, simple sentences with "because", "so", "and", "but"
- Use common everyday words that Band 5 students know
- Avoid complex academic vocabulary or sophisticated expressions`;

    case '5.5_to_6.5':
      return `**Band 5.5-6.5 - USE NATURAL, COMMON ACADEMIC VOCABULARY:**
- Keep tone NATURAL, ACADEMIC, and EASY TO UNDERSTAND
- Use common, accurate vocabulary - NOT advanced or C2 words
- ✅ Use: affordable, accessible, expenses, learners, backgrounds, advantages, disadvantages, opportunities, challenges, develop, provide, support, improve, reduce, facilitate, enhance, individuals, substantial, contemporary, address, tackle, implement, benefit, drawback, aspect, factor, issue, trend, impact, contribute
- ❌ Avoid: engender, ameliorate, proliferate, ubiquitous, paradigm, juxtapose, exemplify excessively
- Use NATURAL COLLOCATIONS: pay for expenses, social backgrounds, affordable and accessible, future careers, practical skills, real-world situations, financial burden, equal opportunities
- Keep it conversational yet academic - like a well-educated person speaking naturally
- Prefer common Band 6-7 words over rare Band 8-9 vocabulary`;

    case '7.0_or_above':
      return `**Band 7.0+ - USE SOPHISTICATED BUT NATURAL VOCABULARY:**
- Use precise, varied academic vocabulary with sophistication
- ✅ Use: equitable, mitigate, incentivize, allocate, foster, cultivate, subsidize, alleviate, comprehensive, proficiency, diversify, innovation, prosperity, sustainability, autonomy, meritocracy, socioeconomic, prioritize, integrate
- Show skillful use of less common vocabulary and idiomatic expressions
- Use sophisticated collocations: equitable access, financial constraints, merit-based system, socioeconomic disparities, intellectual capital, knowledge economy
- Demonstrate lexical flexibility with precise word choice
- Balance sophistication with clarity - avoid unnecessarily obscure words`;

    default:
      return getVocabularyGuidelines('5.5_to_6.5');
  }
}