-- Normalize PFRDA records: lowercase status and entity_type
UPDATE registry_entities SET status = lower(status) WHERE status != lower(status);
UPDATE registry_entities SET entity_type = lower(entity_type) WHERE entity_type != lower(entity_type);

-- Add 'enabler' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'enabler';
