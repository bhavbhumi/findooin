
-- Fix AMFI MFDs: classify entities with business keywords as corporate
UPDATE public.registry_entities 
SET entity_type = 'corporate'
WHERE source = 'amfi' 
  AND registration_category = 'Mutual Fund Distributor' 
  AND entity_type = 'individual'
  AND (
    entity_name ILIKE '%LLP%'
    OR entity_name ILIKE '%Limited%'
    OR entity_name ILIKE '%Private%'
    OR entity_name ILIKE '%Services%'
    OR entity_name ILIKE '%Corporation%'
    OR entity_name ILIKE '%Associates%'
    OR entity_name ILIKE '%Advisors%'
    OR entity_name ILIKE '%Advisory%'
    OR entity_name ILIKE '%Consultants%'
    OR entity_name ILIKE '%Management%'
    OR entity_name ILIKE '%Enterprise%'
    OR entity_name ILIKE '%Finserve%'
    OR entity_name ILIKE '%Financial%'
    OR entity_name ILIKE '%Investments%'
    OR entity_name ILIKE '%Securities%'
    OR entity_name ILIKE '%Capital%'
    OR entity_name ILIKE '%Trust%'
    OR entity_name ILIKE '%Fund%'
    OR entity_name ILIKE '%Group%'
    OR entity_name ILIKE '%Bank%'
    OR entity_name ILIKE '%Co Operative%'
    OR entity_name ILIKE '%Cooperative%'
    OR entity_name ILIKE '%Huf%'
  );

-- Also fix the remaining Ltd. normalization (859 records with Ltd still in name)
UPDATE public.registry_entities
SET entity_name = REPLACE(entity_name, ' Ltd ', ' Limited ')
WHERE entity_name LIKE '% Ltd %';

UPDATE public.registry_entities
SET entity_name = REGEXP_REPLACE(entity_name, ' Ltd\.?$', ' Limited')
WHERE entity_name ~ ' Ltd\.?$';
