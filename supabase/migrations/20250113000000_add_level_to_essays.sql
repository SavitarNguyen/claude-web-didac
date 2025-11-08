-- Add level field to essays table for level-based feedback
ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('5.0_or_below', '5.5_to_6.5', '7.0_or_above'));

-- Set default level for existing essays
UPDATE public.essays
SET level = '5.5_to_6.5'
WHERE level IS NULL;

-- Add comment to document the field
COMMENT ON COLUMN public.essays.level IS 'Student proficiency level: 5.0_or_below (beginner), 5.5_to_6.5 (intermediate), 7.0_or_above (advanced)';
