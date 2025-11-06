-- Add new columns to flashcards table to match XLSX structure
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS vietnamese_translation TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS pronunciation TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS word_type TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS usage_collocations TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS related_words TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS sample_ielts_usage TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN flashcards.topic IS 'Topic category from XLSX';
COMMENT ON COLUMN flashcards.vietnamese_translation IS 'Vietnamese translation from XLSX';
COMMENT ON COLUMN flashcards.pronunciation IS 'Pronunciation guide from XLSX';
COMMENT ON COLUMN flashcards.word_type IS 'Part of speech from XLSX';
COMMENT ON COLUMN flashcards.usage_collocations IS 'Usage and collocations from XLSX';
COMMENT ON COLUMN flashcards.related_words IS 'Related words from XLSX';
COMMENT ON COLUMN flashcards.sample_ielts_usage IS 'Sample IELTS usage from XLSX';
