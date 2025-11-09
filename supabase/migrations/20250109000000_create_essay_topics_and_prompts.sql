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
  suggestion_type VARCHAR(50) NOT NULL, -- 'vocabulary', 'grammar', 'idiom', etc.
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_essay_prompts_topic_id ON public.essay_prompts(topic_id);
CREATE INDEX IF NOT EXISTS idx_vocab_suggestions_prompt_id ON public.vocab_suggestions(prompt_id);

-- Enable RLS
ALTER TABLE public.essay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_suggestions ENABLE ROW LEVEL SECURITY;

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

-- Insert Education topic with the prompt
INSERT INTO public.essay_topics (name, description) VALUES
  ('Education', 'Topics related to education systems, university, learning, and academic development')
ON CONFLICT DO NOTHING;

-- Get the Education topic ID and insert the prompt
DO $$
DECLARE
  education_topic_id UUID;
BEGIN
  SELECT id INTO education_topic_id FROM public.essay_topics WHERE name = 'Education' LIMIT 1;

  IF education_topic_id IS NOT NULL THEN
    INSERT INTO public.essay_prompts (topic_id, title, description) VALUES
      (education_topic_id, 'Free University Education', 'University education should be free to everyone, regardless of income. To what extent do you agree or disagree?')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
