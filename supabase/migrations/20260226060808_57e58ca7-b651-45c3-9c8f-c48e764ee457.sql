
-- Migrate languages from text[] to jsonb to support proficiency and mother tongue
-- First, convert existing data
ALTER TABLE profiles ADD COLUMN languages_new jsonb DEFAULT '[]'::jsonb;

-- Migrate existing text[] data to new jsonb format
UPDATE profiles
SET languages_new = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'code', '',
        'name', lang,
        'proficiency', 'fluent',
        'isMotherTongue', false
      )
    ),
    '[]'::jsonb
  )
  FROM unnest(languages) AS lang
)
WHERE languages IS NOT NULL AND array_length(languages, 1) > 0;

-- Drop old column and rename new one
ALTER TABLE profiles DROP COLUMN languages;
ALTER TABLE profiles RENAME COLUMN languages_new TO languages;
