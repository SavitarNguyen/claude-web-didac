-- Enable Row Level Security on essays table
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to make this migration idempotent)
DROP POLICY IF EXISTS "Users can read their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can insert their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can update their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can delete their own essays" ON public.essays;

-- Create RLS policies for essays table
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

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.essays TO authenticated;
GRANT USAGE ON SEQUENCE public.essays_id_seq TO authenticated;

-- Add comment to document RLS
COMMENT ON TABLE public.essays IS 'Student essays with RLS - users can only access their own essays';
