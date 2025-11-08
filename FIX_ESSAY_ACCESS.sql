-- ============================================
-- COMPLETE FIX FOR ESSAY ACCESS ISSUE
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add missing columns to essays table
ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS corrected_content TEXT;

ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('5.0_or_below', '5.5_to_6.5', '7.0_or_above'));

-- Set default level for existing essays
UPDATE public.essays
SET level = '5.5_to_6.5'
WHERE level IS NULL;

-- Add comments
COMMENT ON COLUMN public.essays.corrected_content IS 'Stores the corrected/revised version of the essay after IELTS analysis';
COMMENT ON COLUMN public.essays.level IS 'Student proficiency level: 5.0_or_below (beginner), 5.5_to_6.5 (intermediate), 7.0_or_above (advanced)';

-- Step 2: Enable Row Level Security
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop any existing policies (make idempotent)
DROP POLICY IF EXISTS "Users can read their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can insert their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can update their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can delete their own essays" ON public.essays;

-- Step 4: Create RLS policies for student access
-- Policy 1: Students can SELECT their own essays
CREATE POLICY "Users can read their own essays"
ON public.essays
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Students can INSERT new essays
CREATE POLICY "Users can insert their own essays"
ON public.essays
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Students can UPDATE their own essays
CREATE POLICY "Users can update their own essays"
ON public.essays
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy 4: Students can DELETE their own essays
CREATE POLICY "Users can delete their own essays"
ON public.essays
FOR DELETE
USING (auth.uid() = user_id);

-- Step 5: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.essays TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 6: Add table documentation
COMMENT ON TABLE public.essays IS 'Student essays with RLS enabled - users can only access their own essays';

-- ============================================
-- Verification queries (optional - run after)
-- ============================================

-- Check if RLS is enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'essays';

-- Check policies exist
SELECT
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'essays';

-- Check columns exist
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'essays'
  AND column_name IN ('corrected_content', 'level', 'user_id');

-- Success message
SELECT
  '✅ RLS policies applied successfully!' as status,
  'Students can now access their essays' as message;
