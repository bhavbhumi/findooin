-- Add public visibility flag and view tracking to registry_entities
ALTER TABLE public.registry_entities 
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claimed_at timestamp with time zone;

-- Create index for public profile lookups
CREATE INDEX IF NOT EXISTS idx_registry_entities_public_lookup 
  ON public.registry_entities (registration_number, is_public) 
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_registry_entities_source_city 
  ON public.registry_entities (source, city, is_public) 
  WHERE is_public = true;

-- Allow anonymous users to read public registry entities (for SEO pages)
CREATE POLICY "Anyone can view public registry entities"
  ON public.registry_entities
  FOR SELECT
  TO anon
  USING (is_public = true AND status = 'active');

-- Allow authenticated users to view public registry entities too  
CREATE POLICY "Authenticated can view public registry entities"
  ON public.registry_entities
  FOR SELECT
  TO authenticated
  USING (is_public = true AND status = 'active');