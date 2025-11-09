-- ============================================
-- QUICK FIX FOR ESSAY ACCESS ISSUE
-- Copy this entire file and paste it in Supabase SQL Editor
-- ============================================

-- Add missing columns
ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS corrected_content TEXT;

ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('5.0_or_below', '5.5_to_6.5', '7.0_or_above'));

-- Enable RLS
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can read their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can insert their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can update their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can delete their own essays" ON public.essays;

-- Create RLS policies
CREATE POLICY "Users can read their own essays" ON public.essays FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own essays" ON public.essays FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own essays" ON public.essays FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own essays" ON public.essays FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.essays TO authenticated;

-- Done!
SELECT 'RLS policies applied successfully!' as status;
