-- Fix the security definer view warning by recreating with security_invoker
DROP VIEW IF EXISTS public.registry_entities_consolidated;

CREATE VIEW public.registry_entities_consolidated
WITH (security_invoker = true)
AS
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
  (
    SELECT string_agg(DISTINCT r->>'registration_category', ', ')
    FROM jsonb_array_elements(COALESCE(re.all_registrations, '[]'::jsonb)) r
    WHERE r->>'registration_category' IS NOT NULL
  ) AS all_categories,
  (
    SELECT string_agg(DISTINCT r->>'registration_number', ', ')
    FROM jsonb_array_elements(COALESCE(re.all_registrations, '[]'::jsonb)) r
    WHERE r->>'registration_number' IS NOT NULL
  ) AS all_registration_numbers
FROM public.registry_entities re
WHERE re.is_primary_record = true;