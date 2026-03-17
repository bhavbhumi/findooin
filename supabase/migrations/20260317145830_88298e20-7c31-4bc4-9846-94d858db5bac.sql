
-- Add subcategory column to kb_articles for grouping articles within categories
ALTER TABLE public.kb_articles ADD COLUMN subcategory text NOT NULL DEFAULT 'general';

-- Add category_slug for URL-friendly category identifiers
ALTER TABLE public.kb_articles ADD COLUMN category_slug text NOT NULL DEFAULT 'general';

-- Add index for category_slug lookups
CREATE INDEX idx_kb_articles_category_slug ON public.kb_articles(category_slug);
CREATE INDEX idx_kb_articles_subcategory ON public.kb_articles(subcategory);
