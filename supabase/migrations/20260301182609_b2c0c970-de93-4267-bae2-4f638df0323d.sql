
-- Work Experience table
CREATE TABLE public.work_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  company_logo_url text,
  location text,
  start_date date NOT NULL,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  description text DEFAULT '',
  employment_type text DEFAULT 'full_time',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view work experiences" ON public.work_experiences FOR SELECT USING (true);
CREATE POLICY "Users can manage own work experiences" ON public.work_experiences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Education table
CREATE TABLE public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  institution text NOT NULL,
  degree text NOT NULL,
  field_of_study text,
  start_year integer NOT NULL,
  end_year integer,
  is_current boolean NOT NULL DEFAULT false,
  grade text,
  description text DEFAULT '',
  activities text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Users can manage own education" ON public.education FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recommendations table
CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  relationship text NOT NULL DEFAULT 'colleague',
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_recommendation CHECK (author_id != recipient_id)
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view accepted recommendations" ON public.recommendations FOR SELECT USING (status = 'accepted' OR author_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Authenticated users can write recommendations" ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own pending recommendations" ON public.recommendations FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = recipient_id);
CREATE POLICY "Authors can delete own recommendations" ON public.recommendations FOR DELETE USING (auth.uid() = author_id);

-- Publications table
CREATE TABLE public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  publication_type text NOT NULL DEFAULT 'article',
  publisher text,
  published_date date,
  url text,
  description text DEFAULT '',
  co_authors text[],
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view publications" ON public.publications FOR SELECT USING (true);
CREATE POLICY "Users can manage own publications" ON public.publications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_work_experiences_updated_at BEFORE UPDATE ON public.work_experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON public.recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON public.publications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
