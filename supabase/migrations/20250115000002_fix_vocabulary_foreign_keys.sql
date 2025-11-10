-- Fix foreign key constraints in vocabulary tables
-- The issue: references auth.users(id) but users are in public.users

-- Drop the existing foreign key constraints
ALTER TABLE public.saved_vocabulary
DROP CONSTRAINT IF EXISTS saved_vocabulary_user_id_fkey;

ALTER TABLE public.student_sentences
DROP CONSTRAINT IF EXISTS student_sentences_user_id_fkey;

ALTER TABLE public.vocabulary_exercise_attempts
DROP CONSTRAINT IF EXISTS vocabulary_exercise_attempts_user_id_fkey;

-- Add corrected foreign key constraints pointing to public.users
ALTER TABLE public.saved_vocabulary
ADD CONSTRAINT saved_vocabulary_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.student_sentences
ADD CONSTRAINT student_sentences_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.vocabulary_exercise_attempts
ADD CONSTRAINT vocabulary_exercise_attempts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update RLS policies to use public.users instead of auth.users
DROP POLICY IF EXISTS "Only admins can manage tags" ON public.vocabulary_tags;

CREATE POLICY "Only admins can manage tags"
    ON public.vocabulary_tags FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));
