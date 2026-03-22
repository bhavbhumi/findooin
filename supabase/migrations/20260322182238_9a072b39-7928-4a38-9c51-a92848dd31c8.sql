
-- Add role mapping and sub_type columns to registry_entities
ALTER TABLE public.registry_entities 
  ADD COLUMN IF NOT EXISTS mapped_role text,
  ADD COLUMN IF NOT EXISTS mapped_sub_type text;

-- Create index for fast filtering by role
CREATE INDEX IF NOT EXISTS idx_registry_entities_mapped_role ON public.registry_entities (mapped_role);

-- ============================================================
-- ROLE MAPPING based on registration_category
-- Classification: memory/business/registry-classification-map
-- ============================================================

-- INTERMEDIARIES
UPDATE public.registry_entities SET mapped_role = 'intermediary', mapped_sub_type = NULL
WHERE registration_category IN ('Investment Adviser', 'Research Analyst', 'Merchant Banker', 'Credit Rating Agency', 'Debentures Trustee', 'Debenture Trustee', 'Banker to Issue', 'Banker to an Issue');

UPDATE public.registry_entities SET mapped_role = 'intermediary', mapped_sub_type = 'stock_broker'
WHERE registration_category LIKE 'Stock Broker%';

UPDATE public.registry_entities SET mapped_role = 'intermediary', mapped_sub_type = 'depository_participant'
WHERE registration_category LIKE 'Depository Participant%'
   OR registration_category IN ('Qualified Depository Participant', 'Designated Depository Participant');

UPDATE public.registry_entities SET mapped_role = 'intermediary', mapped_sub_type = 'point_of_presence'
WHERE registration_category = 'Point of Presence (PoP)';

UPDATE public.registry_entities SET mapped_role = 'intermediary', mapped_sub_type = 'mutual_fund_distributor'
WHERE registration_category = 'Mutual Fund Distributor';

-- ISSUERS
UPDATE public.registry_entities SET mapped_role = 'issuer', mapped_sub_type = NULL
WHERE registration_category IN (
  'Mutual Fund', 'Alternative Investment Fund', 'Portfolio Manager',
  'Venture Capital Fund', 'Foreign Venture Capital Investor',
  'REIT', 'SM REIT', 'Infrastructure Investment Trust'
);

UPDATE public.registry_entities SET mapped_role = 'issuer', mapped_sub_type = 'foreign_portfolio_investor'
WHERE registration_category = 'Foreign Portfolio Investor';

-- ENABLERS
UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'kra'
WHERE registration_category = 'KYC Registration Agency';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'depository'
WHERE registration_category = 'Depository';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'rta'
WHERE registration_category = 'Registrar & Transfer Agent';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'custodian'
WHERE registration_category = 'Custodian';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'vault_manager'
WHERE registration_category = 'Vault Manager';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'asba_bank'
WHERE registration_category LIKE 'SCSB%';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'upi_app'
WHERE registration_category = 'UPI Mobile App';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'esg_provider'
WHERE registration_category = 'ESG Rating Provider';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'clearing_corporation'
WHERE registration_category = 'Clearing Corporation';

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = 'collectibles_exchange'
WHERE registration_category = 'Collectibles Exchange';

-- INVESTORS (FPI, FVCI already handled above as issuer — keep FPI as investor per memory)
-- Actually per the classification map, FPI is investor
UPDATE public.registry_entities SET mapped_role = 'investor'
WHERE registration_category = 'Foreign Portfolio Investor';

-- Manual entries: map based on category keywords
UPDATE public.registry_entities SET mapped_role = 'intermediary', mapped_sub_type = NULL
WHERE mapped_role IS NULL AND source = 'manual'
  AND (registration_category ILIKE '%consultant%' OR registration_category ILIKE '%adviser%');

UPDATE public.registry_entities SET mapped_role = 'enabler', mapped_sub_type = NULL  
WHERE mapped_role IS NULL AND source = 'manual'
  AND (registration_category ILIKE '%infrastructure%' OR registration_category ILIKE '%technology%');

-- Update the consolidated view to include mapped_role and mapped_sub_type
-- Drop and recreate the view
DROP VIEW IF EXISTS public.registry_entities_consolidated;

CREATE VIEW public.registry_entities_consolidated AS
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
