-- Fix vocabulary learning system tables
-- This ensures all tables and policies exist without errors

-- Drop existing policies that might be causing conflicts
DO $$
BEGIN
    -- Drop all existing policies if they exist
    DROP POLICY IF EXISTS "Everyone can read vocabulary definitions" ON public.vocabulary_definitions;
    DROP POLICY IF EXISTS "Authenticated users can insert vocabulary definitions" ON public.vocabulary_definitions;
    DROP POLICY IF EXISTS "Authenticated users can update vocabulary definitions" ON public.vocabulary_definitions;
    DROP POLICY IF EXISTS "Everyone can read vocabulary tags" ON public.vocabulary_tags;
    DROP POLICY IF EXISTS "Only admins can manage tags" ON public.vocabulary_tags;
    DROP POLICY IF EXISTS "Everyone can read vocabulary tag associations" ON public.vocabulary_definition_tags;
    DROP POLICY IF EXISTS "Authenticated users can create tag associations" ON public.vocabulary_definition_tags;
    DROP POLICY IF EXISTS "Users can read their own saved vocabulary" ON public.saved_vocabulary;
    DROP POLICY IF EXISTS "Users can insert their own saved vocabulary" ON public.saved_vocabulary;
    DROP POLICY IF EXISTS "Users can update their own saved vocabulary" ON public.saved_vocabulary;
    DROP POLICY IF EXISTS "Users can delete their own saved vocabulary" ON public.saved_vocabulary;
    DROP POLICY IF EXISTS "Everyone can read vocabulary exercises" ON public.vocabulary_exercise_bank;
    DROP POLICY IF EXISTS "Authenticated users can insert exercises" ON public.vocabulary_exercise_bank;
    DROP POLICY IF EXISTS "Authenticated users can update exercise stats" ON public.vocabulary_exercise_bank;
    DROP POLICY IF EXISTS "Users can read their own sentences" ON public.student_sentences;
    DROP POLICY IF EXISTS "Users can insert their own sentences" ON public.student_sentences;
    DROP POLICY IF EXISTS "Users can delete their own sentences" ON public.student_sentences;
    DROP POLICY IF EXISTS "Users can read their own exercise attempts" ON public.vocabulary_exercise_attempts;
    DROP POLICY IF EXISTS "Users can insert their own exercise attempts" ON public.vocabulary_exercise_attempts;
END $$;

-- Recreate all policies
CREATE POLICY "Everyone can read vocabulary definitions"
    ON public.vocabulary_definitions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert vocabulary definitions"
    ON public.vocabulary_definitions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update vocabulary definitions"
    ON public.vocabulary_definitions FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can read vocabulary tags"
    ON public.vocabulary_tags FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage tags"
    ON public.vocabulary_tags FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Everyone can read vocabulary tag associations"
    ON public.vocabulary_definition_tags FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create tag associations"
    ON public.vocabulary_definition_tags FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can read their own saved vocabulary"
    ON public.saved_vocabulary FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved vocabulary"
    ON public.saved_vocabulary FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved vocabulary"
    ON public.saved_vocabulary FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved vocabulary"
    ON public.saved_vocabulary FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Everyone can read vocabulary exercises"
    ON public.vocabulary_exercise_bank FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert exercises"
    ON public.vocabulary_exercise_bank FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update exercise stats"
    ON public.vocabulary_exercise_bank FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can read their own sentences"
    ON public.student_sentences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sentences"
    ON public.student_sentences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sentences"
    ON public.student_sentences FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own exercise attempts"
    ON public.vocabulary_exercise_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise attempts"
    ON public.vocabulary_exercise_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);
