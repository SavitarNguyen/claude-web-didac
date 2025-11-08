-- Add corrected_content column to essays table to store the corrected version of the essay
ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS corrected_content TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.essays.corrected_content IS 'Stores the corrected/revised version of the essay after IELTS analysis';
