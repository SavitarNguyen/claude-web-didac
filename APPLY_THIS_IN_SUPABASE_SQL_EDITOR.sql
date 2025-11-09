-- =====================================================
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- =====================================================

-- Create essay_topics table
CREATE TABLE IF NOT EXISTS public.essay_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create essay_prompts table
CREATE TABLE IF NOT EXISTS public.essay_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.essay_topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vocab_suggestions table
CREATE TABLE IF NOT EXISTS public.vocab_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.essay_prompts(id) ON DELETE CASCADE,
  suggestion_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate essay_drafts table with correct foreign key
DROP TABLE IF EXISTS public.essay_drafts CASCADE;

-- Create essay_drafts table
CREATE TABLE IF NOT EXISTS public.essay_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.essay_topics(id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES public.essay_prompts(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  parent_draft_id UUID REFERENCES public.essay_drafts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_essay_prompts_topic_id ON public.essay_prompts(topic_id);
CREATE INDEX IF NOT EXISTS idx_vocab_suggestions_prompt_id ON public.vocab_suggestions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_essay_drafts_user_id ON public.essay_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_essay_drafts_topic_id ON public.essay_drafts(topic_id);
CREATE INDEX IF NOT EXISTS idx_essay_drafts_prompt_id ON public.essay_drafts(prompt_id);

-- Enable RLS
ALTER TABLE public.essay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_drafts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view topics" ON public.essay_topics;
DROP POLICY IF EXISTS "Admins can insert topics" ON public.essay_topics;
DROP POLICY IF EXISTS "Admins can update topics" ON public.essay_topics;
DROP POLICY IF EXISTS "Admins can delete topics" ON public.essay_topics;
DROP POLICY IF EXISTS "Anyone can view prompts" ON public.essay_prompts;
DROP POLICY IF EXISTS "Admins can insert prompts" ON public.essay_prompts;
DROP POLICY IF EXISTS "Admins can update prompts" ON public.essay_prompts;
DROP POLICY IF EXISTS "Admins can delete prompts" ON public.essay_prompts;
DROP POLICY IF EXISTS "Anyone can view vocab suggestions" ON public.vocab_suggestions;
DROP POLICY IF EXISTS "Admins can insert vocab suggestions" ON public.vocab_suggestions;
DROP POLICY IF EXISTS "Admins can update vocab suggestions" ON public.vocab_suggestions;
DROP POLICY IF EXISTS "Admins can delete vocab suggestions" ON public.vocab_suggestions;
DROP POLICY IF EXISTS "Users can view own drafts" ON public.essay_drafts;
DROP POLICY IF EXISTS "Users can insert own drafts" ON public.essay_drafts;
DROP POLICY IF EXISTS "Users can update own drafts" ON public.essay_drafts;
DROP POLICY IF EXISTS "Users can delete own drafts" ON public.essay_drafts;

-- RLS Policies for essay_topics
CREATE POLICY "Anyone can view topics" ON public.essay_topics
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert topics" ON public.essay_topics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can update topics" ON public.essay_topics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete topics" ON public.essay_topics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

-- RLS Policies for essay_prompts
CREATE POLICY "Anyone can view prompts" ON public.essay_prompts
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert prompts" ON public.essay_prompts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can update prompts" ON public.essay_prompts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete prompts" ON public.essay_prompts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

-- RLS Policies for vocab_suggestions
CREATE POLICY "Anyone can view vocab suggestions" ON public.vocab_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert vocab suggestions" ON public.vocab_suggestions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can update vocab suggestions" ON public.vocab_suggestions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete vocab suggestions" ON public.vocab_suggestions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

-- RLS Policies for essay_drafts
CREATE POLICY "Users can view own drafts" ON public.essay_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts" ON public.essay_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON public.essay_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON public.essay_drafts
  FOR DELETE USING (auth.uid() = user_id);

-- Insert initial data: Education topic
INSERT INTO public.essay_topics (name, description) VALUES
  ('Education', 'Topics related to education systems, university, learning, and academic development');

-- Insert the Free University Education prompt
INSERT INTO public.essay_prompts (topic_id, title, description)
SELECT id, 'Free University Education', 'University education should be free to everyone, regardless of income. To what extent do you agree or disagree?'
FROM public.essay_topics
WHERE name = 'Education'
LIMIT 1;

-- Verify the data was inserted
SELECT 'Topics created:' as message, COUNT(*) as count FROM public.essay_topics;
SELECT 'Prompts created:' as message, COUNT(*) as count FROM public.essay_prompts;
