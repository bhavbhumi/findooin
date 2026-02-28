
-- Create blog post type enum
CREATE TYPE public.blog_post_type AS ENUM ('article', 'survey', 'poll', 'bulletin');

-- Add post_type column with default 'article'
ALTER TABLE public.blog_posts 
  ADD COLUMN post_type public.blog_post_type NOT NULL DEFAULT 'article';

-- Update existing records based on their current category/content
UPDATE public.blog_posts SET post_type = 'survey' WHERE category = 'awareness' AND title ILIKE '%survey%';
UPDATE public.blog_posts SET post_type = 'poll' WHERE title ILIKE '%poll%' OR content ILIKE '%what do you think%' OR content ILIKE '%vote%poll%';

-- Normalize categories to the new taxonomy
UPDATE public.blog_posts SET category = 'general' WHERE category NOT IN ('general', 'awareness', 'opinion', 'analysis', 'compliance');
