
-- Fix: recreate the view with SECURITY INVOKER (default, safe)
DROP VIEW IF EXISTS public.registry_entities_consolidated;

CREATE VIEW public.registry_entities_consolidated 
WITH (security_invoker = true) AS
SELECT 
  re.id,
  re.source,
  re.source_id,
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
  re.raw_data,
  re.matched_user_id,
  re.last_synced_at,
  re.created_at,
  re.updated_at,
  re.is_public,
  re.view_count,
  re.claimed_at,
  re.consolidated_entity_id,
  re.all_registrations,
  re.is_primary_record,
  re.mapped_role,
  re.mapped_sub_type
FROM public.registry_entities re
WHERE re.is_primary_record = true OR re.consolidated_entity_id IS NULL;
