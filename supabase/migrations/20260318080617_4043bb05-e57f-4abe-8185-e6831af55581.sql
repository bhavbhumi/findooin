
-- Add resource_type and resource_id to reports table for multi-resource reporting
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS resource_type text NOT NULL DEFAULT 'post',
  ADD COLUMN IF NOT EXISTS resource_id text;

-- Backfill existing post reports
UPDATE public.reports SET resource_id = post_id::text WHERE post_id IS NOT NULL AND resource_id IS NULL;

-- Create index for efficient filtering by resource_type
CREATE INDEX IF NOT EXISTS idx_reports_resource_type ON public.reports (resource_type, status);
