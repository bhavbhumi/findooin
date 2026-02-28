
-- Blog Poll Options (each poll blog_post has 2-6 options)
CREATE TABLE public.blog_poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_multi_select boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blog Poll Votes (authenticated users, one vote per poll for single-select, multi for multi-select)
CREATE TABLE public.blog_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.blog_poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blog_post_id, option_id, user_id)
);

-- Blog Survey Questions (each survey blog_post has multiple questions)
CREATE TABLE public.blog_survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'single_choice', -- single_choice, multi_choice, text
  position integer NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blog Survey Options (options per question for choice-type questions)
CREATE TABLE public.blog_survey_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.blog_survey_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  position integer NOT NULL DEFAULT 0
);

-- Blog Survey Responses (user answers)
CREATE TABLE public.blog_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.blog_survey_questions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.blog_survey_options(id) ON DELETE CASCADE,
  text_response text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_blog_poll_options_post ON public.blog_poll_options(blog_post_id);
CREATE INDEX idx_blog_poll_votes_post ON public.blog_poll_votes(blog_post_id);
CREATE INDEX idx_blog_poll_votes_user ON public.blog_poll_votes(user_id);
CREATE INDEX idx_blog_survey_questions_post ON public.blog_survey_questions(blog_post_id);
CREATE INDEX idx_blog_survey_responses_post ON public.blog_survey_responses(blog_post_id);
CREATE INDEX idx_blog_survey_responses_user ON public.blog_survey_responses(user_id);

-- Unique constraint: one survey submission per user per post
CREATE UNIQUE INDEX idx_blog_survey_one_per_user ON public.blog_survey_responses(blog_post_id, question_id, user_id) WHERE option_id IS NOT NULL;

-- RLS
ALTER TABLE public.blog_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_survey_responses ENABLE ROW LEVEL SECURITY;

-- Poll options: anyone can read, admins can manage
CREATE POLICY "Anyone can read poll options" ON public.blog_poll_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage poll options" ON public.blog_poll_options FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Poll votes: anyone can read (for results), authenticated can vote, users can delete own
CREATE POLICY "Anyone can read poll votes" ON public.blog_poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.blog_poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.blog_poll_votes FOR DELETE USING (auth.uid() = user_id);

-- Survey questions: anyone can read, admins can manage
CREATE POLICY "Anyone can read survey questions" ON public.blog_survey_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage survey questions" ON public.blog_survey_questions FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Survey options: anyone can read, admins can manage
CREATE POLICY "Anyone can read survey options" ON public.blog_survey_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage survey options" ON public.blog_survey_options FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Survey responses: anyone can read aggregates, authenticated can submit, users see own
CREATE POLICY "Anyone can read survey responses" ON public.blog_survey_responses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit" ON public.blog_survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own responses" ON public.blog_survey_responses FOR DELETE USING (auth.uid() = user_id);
