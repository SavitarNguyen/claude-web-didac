import { GoogleGenerativeAI } from "@google/generative-ai";
import { IELTSFeedback, SelectedVocabulary, VocabSuggestion, SentenceFeedback } from "@/lib/types/ielts";

const apiKey = process.env.GEMINI_API_KEY || "";
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Selects 3-6 most valuable vocabulary items from essay corrections
 * for students to learn and save to "My Vocabulary"
 */
export async function selectVocabularyForLearning(
  feedback: IELTSFeedback,
  level?: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above'
): Promise<SelectedVocabulary[]> {
  // Collect all vocabulary suggestions from all sentences
  const allVocabSuggestions: Array<{
    vocabSuggestion: VocabSuggestion;
    sentence: SentenceFeedback;
  }> = [];

  feedback.sentences.forEach((sentence) => {
    sentence.vocabSuggestions.forEach((vocabSuggestion) => {
      allVocabSuggestions.push({ vocabSuggestion, sentence });
    });
  });

  // If there are no vocabulary suggestions, return empty array
  if (allVocabSuggestions.length === 0) {
    return [];
  }

  // If there are 6 or fewer suggestions, select all of them
  if (allVocabSuggestions.length <= 6) {
    return allVocabSuggestions.map(({ vocabSuggestion, sentence }) =>
      mapToSelectedVocabulary(vocabSuggestion, sentence, feedback.topic)
    );
  }

  // Use Gemini to intelligently select the best 3-6 vocabulary items
  const selectionPrompt = `You are an expert IELTS vocabulary instructor. Your task is to select the 3-6 MOST VALUABLE vocabulary items from the list below for a student to learn and memorize.

**Student Level:** ${getLevelDescription(level)}
**Essay Topic:** ${feedback.topic}
**Student's Current Band:** ${feedback.overallBand}

**Selection Criteria (in order of priority):**
1. **Topic Relevance:** Vocabulary that is useful across multiple essays on this topic
2. **IELTS Value:** Words/phrases that help achieve Band 6.5-8.0 (not too basic, not too advanced)
3. **Reusability:** Collocations and phrases are better than single words
4. **Natural Usage:** Prefer natural academic collocations over rare vocabulary
5. **Learning Load:** Avoid overwhelming the student - select only the BEST items

**Important Guidelines:**
- Select 3-6 items ONLY (prefer 4-5 for optimal learning)
- Prioritize collocations and phrases over single words
- Choose vocabulary appropriate for the student's level
- Avoid basic words the student likely knows (e.g., "important", "good")
- Avoid overly complex C2-level vocabulary unless student is advanced
- Consider which vocabulary will help most with future essays

**Available Vocabulary Suggestions:**
${JSON.stringify(
  allVocabSuggestions.map(({ vocabSuggestion, sentence }, index) => ({
    index: index,
    original: vocabSuggestion.original,
    suggestion: vocabSuggestion.suggestion,
    explanation: vocabSuggestion.explanation,
    example: vocabSuggestion.example,
    sentenceContext: sentence.correctedSentence,
    sentenceId: sentence.id,
  })),
  null,
  2
)}

**Response Format (JSON ONLY):**
{
  "selectedIndices": [0, 3, 5, 8],
  "reasoning": "Brief explanation of why these were chosen"
}

Return ONLY valid JSON with 3-6 selected indices.`;

  try {
    const geminiModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await geminiModel.generateContent([selectionPrompt]);
    const response = await result.response;
    const selectionResult = JSON.parse(response.text());

    console.log(`Vocabulary Selection: ${selectionResult.reasoning}`);

    // Map selected indices to SelectedVocabulary objects
    const selectedVocabulary: SelectedVocabulary[] = selectionResult.selectedIndices
      .filter((index: number) => index >= 0 && index < allVocabSuggestions.length)
      .map((index: number) => {
        const { vocabSuggestion, sentence } = allVocabSuggestions[index];
        return mapToSelectedVocabulary(vocabSuggestion, sentence, feedback.topic);
      });

    return selectedVocabulary;
  } catch (error) {
    console.error("Error selecting vocabulary:", error);

    // Fallback: Select first 5 vocabulary suggestions if AI selection fails
    console.log("Falling back to selecting first 5 vocabulary items");
    return allVocabSuggestions
      .slice(0, 5)
      .map(({ vocabSuggestion, sentence }) =>
        mapToSelectedVocabulary(vocabSuggestion, sentence, feedback.topic)
      );
  }
}

/**
 * Maps a VocabSuggestion to a SelectedVocabulary object
 */
function mapToSelectedVocabulary(
  vocabSuggestion: VocabSuggestion,
  sentence: SentenceFeedback,
  topic: string
): SelectedVocabulary {
  // Determine vocabulary type
  const wordCount = vocabSuggestion.suggestion.split(/\s+/).length;
  let type: 'word' | 'phrase' | 'collocation';

  if (wordCount === 1) {
    type = 'word';
  } else if (wordCount === 2 || wordCount === 3) {
    type = 'collocation';
  } else {
    type = 'phrase';
  }

  // Determine IELTS level based on vocabulary sophistication
  const ieltsLevel = determineIELTSLevel(vocabSuggestion.suggestion);

  // Generate tags based on topic
  const tags = generateTags(topic, vocabSuggestion.suggestion);

  return {
    term: vocabSuggestion.suggestion,
    type,
    original: vocabSuggestion.original,
    definition: vocabSuggestion.explanation, // Use explanation as definition
    explanation: vocabSuggestion.explanation,
    exampleSentence: sentence.correctedSentence,
    sentenceId: sentence.id,
    ieltsLevel,
    tags,
  };
}

/**
 * Determines IELTS band level for vocabulary
 */
function determineIELTSLevel(word: string): string {
  // Simple heuristic based on word characteristics
  // In production, this could use a vocabulary level database

  const advancedWords = [
    'mitigate', 'facilitate', 'contemporary', 'prevalent', 'substantial',
    'allocate', 'leverage', 'cultivate', 'foster', 'navigate'
  ];

  const upperIntermediateWords = [
    'affordable', 'accessible', 'enhance', 'reduce', 'improve',
    'develop', 'provide', 'support', 'challenge', 'opportunity'
  ];

  const lowerWord = word.toLowerCase();

  if (advancedWords.some(w => lowerWord.includes(w))) {
    return 'Band 7.0-8.0';
  } else if (upperIntermediateWords.some(w => lowerWord.includes(w))) {
    return 'Band 6.5-7.0';
  } else {
    return 'Band 6.0-6.5';
  }
}

/**
 * Generates topic tags for vocabulary
 */
function generateTags(topic: string, word: string): string[] {
  const tags: string[] = ['academic']; // All IELTS vocab gets 'academic' tag

  // Extract topic-related tags
  const topicKeywords: Record<string, string[]> = {
    environment: ['environment', 'climate', 'pollution', 'sustainability', 'ecology'],
    education: ['education', 'learning', 'school', 'university', 'student'],
    technology: ['technology', 'digital', 'internet', 'computer', 'online'],
    health: ['health', 'medical', 'hospital', 'disease', 'treatment'],
    business: ['business', 'economy', 'company', 'market', 'trade'],
    culture: ['culture', 'society', 'tradition', 'community', 'social'],
    government: ['government', 'policy', 'politics', 'law', 'regulation'],
  };

  const lowerTopic = topic.toLowerCase();
  const lowerWord = word.toLowerCase();

  for (const [tag, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerTopic.includes(keyword) || lowerWord.includes(keyword))) {
      tags.push(tag);
    }
  }

  // If no specific tag matched, use 'general'
  if (tags.length === 1) {
    tags.push('general');
  }

  return tags;
}

/**
 * Gets level description for prompt
 */
function getLevelDescription(level?: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above'): string {
  switch (level) {
    case '5.0_or_below':
      return 'Beginner (Band 5.0 or below) - Focus on fundamental vocabulary';
    case '5.5_to_6.5':
      return 'Intermediate (Band 5.5-6.5) - Focus on common academic vocabulary';
    case '7.0_or_above':
      return 'Advanced (Band 7.0+) - Focus on sophisticated academic vocabulary';
    default:
      return 'Intermediate (Band 5.5-6.5) - Focus on common academic vocabulary';
  }
}
