
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS designation text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS experience_years integer,
  ADD COLUMN IF NOT EXISTS specializations text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS regulatory_ids jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT '{}';
