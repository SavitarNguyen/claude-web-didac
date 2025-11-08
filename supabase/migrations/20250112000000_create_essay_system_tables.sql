-- Create essay topics table
CREATE TABLE IF NOT EXISTS public.essay_topics (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create essay prompts table
CREATE TABLE IF NOT EXISTS public.essay_prompts (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    topic_id UUID REFERENCES public.essay_topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create essay vocab suggestions table
CREATE TABLE IF NOT EXISTS public.essay_vocab_suggestions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES public.essay_prompts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    suggestion_type TEXT DEFAULT 'vocabulary', -- 'vocabulary' or 'grammar'
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create essay drafts table
CREATE TABLE IF NOT EXISTS public.essay_drafts (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.essay_topics(id) ON DELETE SET NULL,
    prompt_id UUID REFERENCES public.essay_prompts(id) ON DELETE SET NULL,
    title TEXT,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    parent_draft_id UUID REFERENCES public.essay_drafts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default topics
INSERT INTO public.essay_topics (name, description) VALUES
    ('Business', 'Business and economics related essay topics'),
    ('Law', 'Legal and justice system topics'),
    ('Education', 'Education system and learning topics'),
    ('Environment', 'Environmental and sustainability topics'),
    ('Politics', 'Political and governance topics'),
    ('Culture', 'Cultural and social topics'),
    ('Health', 'Health and medical topics'),
    ('Technology', 'Technology and innovation topics')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_essay_prompts_topic_id ON public.essay_prompts(topic_id);
CREATE INDEX IF NOT EXISTS idx_essay_vocab_suggestions_prompt_id ON public.essay_vocab_suggestions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_essay_drafts_user_id ON public.essay_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_essay_drafts_is_current ON public.essay_drafts(is_current);

-- Grant permissions
GRANT ALL ON public.essay_topics TO authenticated;
GRANT ALL ON public.essay_prompts TO authenticated;
GRANT ALL ON public.essay_vocab_suggestions TO authenticated;
GRANT ALL ON public.essay_drafts TO authenticated;

-- Enable RLS
ALTER TABLE public.essay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_vocab_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for essay_topics
CREATE POLICY "Everyone can read topics" ON public.essay_topics FOR SELECT USING (true);
CREATE POLICY "Only admins can insert topics" ON public.essay_topics FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));
CREATE POLICY "Only admins can update topics" ON public.essay_topics FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));
CREATE POLICY "Only admins can delete topics" ON public.essay_topics FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for essay_prompts
CREATE POLICY "Everyone can read prompts" ON public.essay_prompts FOR SELECT USING (true);
CREATE POLICY "Only admins can insert prompts" ON public.essay_prompts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));
CREATE POLICY "Only admins can update prompts" ON public.essay_prompts FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));
CREATE POLICY "Only admins can delete prompts" ON public.essay_prompts FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for essay_vocab_suggestions
CREATE POLICY "Everyone can read vocab suggestions" ON public.essay_vocab_suggestions FOR SELECT USING (true);
CREATE POLICY "Only admins can insert vocab suggestions" ON public.essay_vocab_suggestions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));
CREATE POLICY "Only admins can update vocab suggestions" ON public.essay_vocab_suggestions FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));
CREATE POLICY "Only admins can delete vocab suggestions" ON public.essay_vocab_suggestions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for essay_drafts
CREATE POLICY "Users can read their own drafts" ON public.essay_drafts FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own drafts" ON public.essay_drafts FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own drafts" ON public.essay_drafts FOR UPDATE
    USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drafts" ON public.essay_drafts FOR DELETE
    USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.essay_topics IS 'Essay topics like Business, Law, Education, etc.';
COMMENT ON TABLE public.essay_prompts IS 'Specific essay questions under each topic';
COMMENT ON TABLE public.essay_vocab_suggestions IS 'Vocabulary and grammar suggestions for each prompt';
COMMENT ON TABLE public.essay_drafts IS 'User essay drafts with version history';
