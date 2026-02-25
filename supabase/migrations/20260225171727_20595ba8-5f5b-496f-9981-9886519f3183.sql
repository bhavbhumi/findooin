
-- 1. Add new post_type enum values for Investor posts
ALTER TYPE public.post_type ADD VALUE IF NOT EXISTS 'requirement';
ALTER TYPE public.post_type ADD VALUE IF NOT EXISTS 'expert_find';

-- 2. Add message_category column to messages table
DO $$ BEGIN
  CREATE TYPE public.message_category AS ENUM ('general', 'sales', 'ops', 'accounts', 'support', 'complaint');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS category public.message_category NOT NULL DEFAULT 'general';
