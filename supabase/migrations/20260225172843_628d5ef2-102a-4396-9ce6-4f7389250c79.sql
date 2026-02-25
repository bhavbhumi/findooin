
-- Add 'query' to the post_type enum
ALTER TYPE public.post_type ADD VALUE IF NOT EXISTS 'query';

-- Create query_category enum
DO $$ BEGIN
  CREATE TYPE public.query_category AS ENUM ('expert_find', 'requirement');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add query_category column to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS query_category public.query_category;

-- Remove requirement and expert_find from post_type enum (replace enum)
-- Since we can't remove values from enums easily, and they were just added,
-- we'll leave them in the enum but they won't be used in the UI.
-- The UI will only expose 'query' for investors.
