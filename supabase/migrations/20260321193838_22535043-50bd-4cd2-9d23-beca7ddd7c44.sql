
-- Remove duplicate registry_entities, keeping the most recently synced record per (source, registration_category, entity_name)
DELETE FROM public.registry_entities
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY source, registration_category, entity_name
        ORDER BY last_synced_at DESC NULLS LAST, created_at DESC
      ) AS rn
    FROM public.registry_entities
  ) ranked
  WHERE rn > 1
);

-- Add a unique index to prevent future duplicates (handles entities with and without source_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_registry_entities_dedup
ON public.registry_entities (source, registration_category, entity_name)
WHERE source_id IS NULL;
