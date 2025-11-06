-- Copy data from old field names to new field names
UPDATE flashcards 
SET 
  meaning = definition,
  examples = example
WHERE meaning IS NULL OR examples IS NULL;

-- Verify the update
SELECT COUNT(*) as updated_rows FROM flashcards WHERE meaning IS NOT NULL AND examples IS NOT NULL; 