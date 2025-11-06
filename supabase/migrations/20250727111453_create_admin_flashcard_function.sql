-- Create a function to insert flashcards that bypasses RLS
CREATE OR REPLACE FUNCTION insert_flashcard_admin(
  set_id UUID,
  word TEXT,
  definition TEXT,
  example TEXT DEFAULT NULL,
  topic TEXT DEFAULT NULL,
  vietnamese_translation TEXT DEFAULT NULL,
  pronunciation TEXT DEFAULT NULL,
  word_type TEXT DEFAULT NULL,
  usage_collocations TEXT DEFAULT NULL,
  related_words TEXT DEFAULT NULL,
  sample_ielts_usage TEXT DEFAULT NULL
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
    NOW()
  );
  
  -- Update the card count for the set
  UPDATE flashcard_sets 
  SET card_count = (
    SELECT COUNT(*) 
    FROM flashcards 
    WHERE set_id = insert_flashcard_admin.set_id
  )
  WHERE id = set_id;
  
  RETURN flashcard_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_flashcard_admin TO authenticated;
