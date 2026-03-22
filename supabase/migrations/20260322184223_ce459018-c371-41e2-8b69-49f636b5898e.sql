DROP FUNCTION IF EXISTS public.consolidate_registry_entities();

CREATE OR REPLACE FUNCTION public.consolidate_registry_entities()
  RETURNS TABLE(groups_found INTEGER, records_consolidated INTEGER)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_groups INTEGER := 0;
  v_records INTEGER := 0;
  rec RECORD;
BEGIN
  -- Reset all consolidation flags
  UPDATE public.registry_entities
  SET consolidated_entity_id = NULL,
      is_primary_record = true,
      all_registrations = '[]'::jsonb;

  FOR rec IN
    WITH normalized AS (
      SELECT
        id,
        -- Collapse ALL whitespace for fuzzy name matching
        LOWER(REGEXP_REPLACE(TRIM(entity_name), '\s+', '', 'g')) AS compact_name,
        LOWER(TRIM(COALESCE(contact_email, ''))) AS norm_email,
        REGEXP_REPLACE(COALESCE(contact_phone, ''), '[^0-9]', '', 'g') AS norm_phone,
        entity_name, registration_number, registration_category,
        entity_type, contact_email, contact_phone, source, created_at
      FROM public.registry_entities
      WHERE contact_email IS NULL OR contact_email NOT LIKE '%location%'
    ),
    -- Group by compact name + email
    email_groups AS (
      SELECT compact_name, norm_email,
        array_agg(id ORDER BY created_at) AS member_ids
      FROM normalized
      WHERE norm_email != '' AND LENGTH(norm_email) > 5
      GROUP BY compact_name, norm_email
      HAVING count(*) > 1
    ),
    -- Group by compact name + phone (not already email-grouped)
    phone_groups AS (
      SELECT n.compact_name, n.norm_phone,
        array_agg(n.id ORDER BY n.created_at) AS member_ids
      FROM normalized n
      WHERE n.norm_phone != '' AND LENGTH(n.norm_phone) >= 8
        AND NOT EXISTS (SELECT 1 FROM email_groups eg WHERE n.id = ANY(eg.member_ids))
      GROUP BY n.compact_name, n.norm_phone
      HAVING count(*) > 1
    ),
    -- Name-only groups for cross-category broker ecosystem entities
    name_groups AS (
      SELECT compact_name,
        array_agg(id ORDER BY created_at) AS member_ids
      FROM normalized n
      WHERE NOT EXISTS (SELECT 1 FROM email_groups eg WHERE n.id = ANY(eg.member_ids))
        AND NOT EXISTS (SELECT 1 FROM phone_groups pg WHERE n.id = ANY(pg.member_ids))
      GROUP BY compact_name
      HAVING count(*) > 1
        AND (
          -- Same contact info (just whitespace diff in name)
          count(DISTINCT norm_email) FILTER (WHERE norm_email != '') <= 1
          OR count(DISTINCT norm_phone) FILTER (WHERE norm_phone != '' AND LENGTH(norm_phone) >= 8) <= 1
          -- Cross-category non-individual entities (broker ecosystem)
          OR (
            count(DISTINCT registration_category) > 1
            AND bool_and(entity_type IS NULL OR entity_type != 'individual')
          )
        )
    ),
    all_groups AS (
      SELECT member_ids FROM email_groups
      UNION ALL SELECT member_ids FROM phone_groups
      UNION ALL SELECT member_ids FROM name_groups
    )
    SELECT member_ids FROM all_groups
  LOOP
    v_groups := v_groups + 1;
    v_records := v_records + array_length(rec.member_ids, 1);

    UPDATE public.registry_entities
    SET consolidated_entity_id = rec.member_ids[1], is_primary_record = false
    WHERE id = ANY(rec.member_ids[2:]);

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

  -- Non-duplicated records get their own info
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
$function$;