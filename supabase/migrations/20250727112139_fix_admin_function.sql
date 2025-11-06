-- Drop the old function and recreate it with proper column references
DROP FUNCTION IF EXISTS insert_flashcard_admin(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Create a function to insert flashcards that bypasses RLS
CREATE OR REPLACE FUNCTION insert_flashcard_admin(
  p_set_id UUID,
  p_word TEXT,
  p_definition TEXT,
  p_example TEXT DEFAULT NULL,
  p_topic TEXT DEFAULT NULL,
  p_vietnamese_translation TEXT DEFAULT NULL,
  p_pronunciation TEXT DEFAULT NULL,
  p_word_type TEXT DEFAULT NULL,
  p_usage_collocations TEXT DEFAULT NULL,
  p_related_words TEXT DEFAULT NULL,
  p_sample_ielts_usage TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  flashcard_id UUID;
BEGIN
  -- Generate a new UUID for the flashcard
  flashcard_id := gen_random_uuid();
  
  -- Insert the flashcard with all the new columns
  INSERT INTO flashcards (
    id,
    set_id,
    word,
    definition,
    example,
    topic,
    vietnamese_translation,
    pronunciation,
    word_type,
    usage_collocations,
    related_words,
    sample_ielts_usage,
    created_at
  ) VALUES (
    flashcard_id,
    p_set_id,
    p_word,
    p_definition,
    p_example,
    p_topic,
    p_vietnamese_translation,
    p_pronunciation,
    p_word_type,
    p_usage_collocations,
    p_related_words,
    p_sample_ielts_usage,
    NOW()
  );
  
  -- Update the card count for the set
  UPDATE flashcard_sets 
  SET card_count = (
    SELECT COUNT(*) 
    FROM flashcards 
    WHERE set_id = p_set_id
  )
  WHERE id = p_set_id;
  
  RETURN flashcard_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_flashcard_admin TO authenticated;
