
-- Knowledge Base articles table
CREATE TABLE public.kb_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  read_time_minutes INTEGER NOT NULL DEFAULT 3,
  published BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles (public knowledge base)
CREATE POLICY "Anyone can read published KB articles"
ON public.kb_articles FOR SELECT
USING (published = true);

-- Admins can manage all articles
CREATE POLICY "Admins can manage KB articles"
ON public.kb_articles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_kb_articles_category ON public.kb_articles(category);
CREATE INDEX idx_kb_articles_slug ON public.kb_articles(slug);
