
-- Add visibility enum
CREATE TYPE public.post_visibility AS ENUM ('public', 'network', 'following', 'followers', 'connections', 'private');

-- Add post_kind enum (Normal, Poll, Survey)
CREATE TYPE public.post_kind AS ENUM ('normal', 'poll', 'survey');

-- Add new columns to posts
ALTER TABLE public.posts 
  ADD COLUMN visibility public.post_visibility NOT NULL DEFAULT 'public',
  ADD COLUMN post_kind public.post_kind NOT NULL DEFAULT 'normal',
  ADD COLUMN scheduled_at timestamptz NULL;

-- Poll options table
CREATE TABLE public.poll_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Poll votes table
CREATE TABLE public.poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_option_id uuid NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(poll_option_id, user_id)
);

-- Survey questions table (survey = multiple questions, each with options)
CREATE TABLE public.survey_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'single_choice',
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Survey options (choices per question)
CREATE TABLE public.survey_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  position int NOT NULL DEFAULT 0
);

-- Survey responses
CREATE TABLE public.survey_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.survey_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- RLS on all new tables
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Poll options: anyone can read, author can insert
CREATE POLICY "Anyone can read poll options" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Post author can insert poll options" ON public.poll_options FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
);

-- Poll votes: anyone authed can vote, can read all
CREATE POLICY "Anyone can read poll votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Authed users can vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id);

-- Survey questions: anyone can read, author can insert
CREATE POLICY "Anyone can read survey questions" ON public.survey_questions FOR SELECT USING (true);
CREATE POLICY "Post author can insert survey questions" ON public.survey_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
);

-- Survey options: anyone can read, question author can insert
CREATE POLICY "Anyone can read survey options" ON public.survey_options FOR SELECT USING (true);
CREATE POLICY "Author can insert survey options" ON public.survey_options FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.survey_questions sq
    JOIN public.posts p ON p.id = sq.post_id
    WHERE sq.id = question_id AND p.author_id = auth.uid()
  )
);

-- Survey responses: authed users can respond, can read all
CREATE POLICY "Anyone can read survey responses" ON public.survey_responses FOR SELECT USING (true);
CREATE POLICY "Authed users can respond" ON public.survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
