-- ============================================
-- MIGRATION SCRIPT FOR ESSAYS TABLE
-- Apply this in Supabase SQL Editor
-- ============================================

-- Step 1: Add corrected_content column (if not exists)
ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS corrected_content TEXT;

COMMENT ON COLUMN public.essays.corrected_content IS 'Stores the corrected/revised version of the essay after IELTS analysis';

-- Step 2: Add level column (if not exists)
ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('5.0_or_below', '5.5_to_6.5', '7.0_or_above'));

-- Set default level for existing essays
UPDATE public.essays
SET level = '5.5_to_6.5'
WHERE level IS NULL;

COMMENT ON COLUMN public.essays.level IS 'Student proficiency level: 5.0_or_below (beginner), 5.5_to_6.5 (intermediate), 7.0_or_above (advanced)';

-- Step 3: Enable Row Level Security
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if any (to make this migration idempotent)
DROP POLICY IF EXISTS "Users can read their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can insert their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can update their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can delete their own essays" ON public.essays;

-- Step 5: Create RLS policies for essays table
-- Students can only see their own essays
CREATE POLICY "Users can read their own essays" ON public.essays FOR SELECT
    USING (auth.uid() = user_id);

-- Students can create essays (system will set user_id)
CREATE POLICY "Users can insert their own essays" ON public.essays FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Students can update their own essays
CREATE POLICY "Users can update their own essays" ON public.essays FOR UPDATE
    USING (auth.uid() = user_id);

-- Students can delete their own essays
CREATE POLICY "Users can delete their own essays" ON public.essays FOR DELETE
    USING (auth.uid() = user_id);

-- Step 6: Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.essays TO authenticated;

-- Step 7: Add documentation
COMMENT ON TABLE public.essays IS 'Student essays with RLS - users can only access their own essays';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
