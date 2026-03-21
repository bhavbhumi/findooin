-- Add consolidation columns to registry_entities
ALTER TABLE public.registry_entities
  ADD COLUMN IF NOT EXISTS consolidated_entity_id UUID,
  ADD COLUMN IF NOT EXISTS all_registrations JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_primary_record BOOLEAN DEFAULT true;

-- Index for fast consolidation lookups
CREATE INDEX IF NOT EXISTS idx_registry_consolidated_entity
  ON public.registry_entities (consolidated_entity_id)
  WHERE consolidated_entity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_registry_entity_name_lower
  ON public.registry_entities (LOWER(TRIM(entity_name)));

CREATE INDEX IF NOT EXISTS idx_registry_contact_email_lower
  ON public.registry_entities (LOWER(TRIM(contact_email)))
  WHERE contact_email IS NOT NULL AND contact_email != '';

-- Function to consolidate duplicate registry entities
-- Matches on: exact name (case-insensitive) + same email OR same phone
CREATE OR REPLACE FUNCTION public.consolidate_registry_entities()
RETURNS TABLE(groups_found INTEGER, records_consolidated INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_groups INTEGER := 0;
  v_records INTEGER := 0;
  rec RECORD;
BEGIN
  -- Reset all consolidation flags first
  UPDATE public.registry_entities
  SET consolidated_entity_id = NULL,
      is_primary_record = true,
      all_registrations = '[]'::jsonb;

  -- Find duplicate groups: same normalized name + (same email OR same phone)
  FOR rec IN
    WITH normalized AS (
      SELECT
        id,
        LOWER(TRIM(entity_name)) AS norm_name,
        LOWER(TRIM(COALESCE(contact_email, ''))) AS norm_email,
        REGEXP_REPLACE(COALESCE(contact_phone, ''), '[^0-9]', '', 'g') AS norm_phone,
        entity_name,
        registration_number,
        registration_category,
        entity_type,
        contact_email,
        contact_phone,
        address,
        city,
        state,
        source,
        created_at
      FROM public.registry_entities
      -- Skip records with obviously bad/garbled emails
      WHERE contact_email IS NULL
         OR contact_email NOT LIKE '%location%'
    ),
    -- Group by name + email match
    email_groups AS (
      SELECT
        norm_name,
        norm_email,
        array_agg(id ORDER BY created_at) AS member_ids
      FROM normalized
      WHERE norm_email != ''
        AND LENGTH(norm_email) > 5
      GROUP BY norm_name, norm_email
      HAVING count(*) > 1
    ),
    -- Group by name + phone match (only for records not already email-grouped)
    phone_groups AS (
      SELECT
        n.norm_name,
        n.norm_phone,
        array_agg(n.id ORDER BY n.created_at) AS member_ids
      FROM normalized n
      WHERE n.norm_phone != ''
        AND LENGTH(n.norm_phone) >= 8
        AND NOT EXISTS (
          SELECT 1 FROM email_groups eg
          WHERE n.id = ANY(eg.member_ids)
        )
      GROUP BY n.norm_name, n.norm_phone
      HAVING count(*) > 1
    ),
    -- Also group exact name matches where BOTH records share the same name
    -- and at least one has a non-garbled email
    name_groups AS (
      SELECT
        norm_name,
        array_agg(id ORDER BY created_at) AS member_ids
      FROM normalized n
      WHERE NOT EXISTS (
        SELECT 1 FROM email_groups eg WHERE n.id = ANY(eg.member_ids)
      )
      AND NOT EXISTS (
        SELECT 1 FROM phone_groups pg WHERE n.id = ANY(pg.member_ids)
      )
      GROUP BY norm_name
      HAVING count(*) > 1
        -- Only auto-merge name-only if they share email or phone
        AND (
          count(DISTINCT norm_email) FILTER (WHERE norm_email != '') <= 1
          OR count(DISTINCT norm_phone) FILTER (WHERE norm_phone != '' AND LENGTH(norm_phone) >= 8) <= 1
        )
    ),
    all_groups AS (
      SELECT member_ids FROM email_groups
      UNION ALL
      SELECT member_ids FROM phone_groups
      UNION ALL
      SELECT member_ids FROM name_groups
    )
    SELECT member_ids FROM all_groups
  LOOP
    v_groups := v_groups + 1;
    v_records := v_records + array_length(rec.member_ids, 1);

    -- First member is the primary record
    -- Mark all others as non-primary, pointing to the primary
    UPDATE public.registry_entities
    SET consolidated_entity_id = rec.member_ids[1],
        is_primary_record = false
    WHERE id = ANY(rec.member_ids[2:]);

    -- Build all_registrations JSONB array on the primary record
    UPDATE public.registry_entities
    SET consolidated_entity_id = rec.member_ids[1],
        is_primary_record = true,
        all_registrations = (
          SELECT jsonb_agg(jsonb_build_object(
            'registration_number', re.registration_number,
            'registration_category', re.registration_category,
            'entity_type', re.entity_type,
            'source', re.source,
            'contact_email', re.contact_email,
            'status', re.status
          ) ORDER BY re.created_at)
          FROM public.registry_entities re
          WHERE re.id = ANY(rec.member_ids)
        )
    WHERE id = rec.member_ids[1];
  END LOOP;

  -- For non-duplicated records, set all_registrations to their own info
  UPDATE public.registry_entities
  SET all_registrations = jsonb_build_array(jsonb_build_object(
    'registration_number', registration_number,
    'registration_category', registration_category,
    'entity_type', entity_type,
    'source', source,
    'contact_email', contact_email,
    'status', status
  ))
  WHERE consolidated_entity_id IS NULL;

  RETURN QUERY SELECT v_groups, v_records;
END;
$$;

-- Consolidated view for the directory: shows only primary records with merged data
CREATE OR REPLACE VIEW public.registry_entities_consolidated AS
SELECT
  re.id,
  re.entity_name,
  re.entity_type,
  re.registration_number,
  re.registration_category,
  re.contact_email,
  re.contact_phone,
  re.address,
  re.city,
  re.state,
  re.pincode,
  re.status,
  re.source,
  re.source_id,
  re.matched_user_id,
  re.claimed_at,
  re.is_public,
  re.view_count,
  re.last_synced_at,
  re.created_at,
  re.updated_at,
  re.all_registrations,
  re.consolidated_entity_id,
  jsonb_array_length(COALESCE(re.all_registrations, '[]'::jsonb)) AS registration_count,
  -- Aggregate all categories for display
  (
    SELECT string_agg(DISTINCT r->>'registration_category', ', ')
    FROM jsonb_array_elements(COALESCE(re.all_registrations, '[]'::jsonb)) r
    WHERE r->>'registration_category' IS NOT NULL
  ) AS all_categories,
  -- Aggregate all registration numbers
  (
    SELECT string_agg(DISTINCT r->>'registration_number', ', ')
    FROM jsonb_array_elements(COALESCE(re.all_registrations, '[]'::jsonb)) r
    WHERE r->>'registration_number' IS NOT NULL
  ) AS all_registration_numbers
FROM public.registry_entities re
WHERE re.is_primary_record = true;