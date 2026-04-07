
-- Add pan_number column to profiles if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'pan_number') THEN
    ALTER TABLE public.profiles ADD COLUMN pan_number TEXT;
  END IF;
END $$;

-- Create unique index on pan_number (only non-null values, case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_pan_unique ON public.profiles (UPPER(pan_number)) WHERE pan_number IS NOT NULL AND pan_number != '';
