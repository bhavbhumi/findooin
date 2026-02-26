
-- Blog posts table for public masonry blog
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  author_name TEXT NOT NULL DEFAULT 'FindOO Team',
  author_avatar_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  read_time_minutes INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read for published posts (no auth needed)
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (published = true);

-- Only service role can insert/update/delete (admin managed)
-- No user-facing write policies needed

-- Index for fast slug lookups and published filtering
CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts (published, published_at DESC);
