
-- Registry Entities: scraped from AMFI/SEBI for prospecting & verification
CREATE TABLE public.registry_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'manual',  -- 'amfi', 'sebi', 'manual'
  source_id text,                          -- ARN number, SEBI reg no, etc.
  entity_name text NOT NULL,
  entity_type text,                        -- 'distributor', 'ria', 'broker', 'amc', etc.
  registration_number text,
  registration_category text,              -- sub-category from regulator
  contact_email text,
  contact_phone text,
  address text,
  city text,
  state text,
  pincode text,
  status text NOT NULL DEFAULT 'active',   -- 'active', 'inactive', 'suspended'
  raw_data jsonb DEFAULT '{}'::jsonb,       -- full scraped record
  matched_user_id uuid,                    -- linked to profiles.id if joined
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for lookups
CREATE INDEX idx_registry_source ON public.registry_entities(source);
CREATE INDEX idx_registry_reg_number ON public.registry_entities(registration_number);
CREATE INDEX idx_registry_matched_user ON public.registry_entities(matched_user_id) WHERE matched_user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_registry_source_id ON public.registry_entities(source, source_id) WHERE source_id IS NOT NULL;

ALTER TABLE public.registry_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage registry entities" ON public.registry_entities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Invitations: outreach lifecycle tracking
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_entity_id uuid REFERENCES public.registry_entities(id) ON DELETE SET NULL,
  target_email text NOT NULL,
  target_name text,
  target_phone text,
  target_role text NOT NULL DEFAULT 'intermediary', -- 'issuer', 'intermediary'
  status text NOT NULL DEFAULT 'active',             -- 'active', 'archived', 'converted', 'opted_out'
  reminder_count integer NOT NULL DEFAULT 0,
  max_reminders integer NOT NULL DEFAULT 7,
  last_reminder_at timestamptz,
  next_reminder_at timestamptz,
  archived_at timestamptz,
  reactivate_after timestamptz,
  converted_user_id uuid,                            -- profiles.id once they join
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_status ON public.invitations(status);
CREATE INDEX idx_invitations_next_reminder ON public.invitations(next_reminder_at) WHERE status = 'active';
CREATE INDEX idx_invitations_email ON public.invitations(target_email);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations" ON public.invitations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sales Leads: CRM pipeline
CREATE TABLE public.sales_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_entity_id uuid REFERENCES public.registry_entities(id) ON DELETE SET NULL,
  invitation_id uuid REFERENCES public.invitations(id) ON DELETE SET NULL,
  lead_name text NOT NULL,
  lead_email text,
  lead_phone text,
  company_name text,
  lead_source text NOT NULL DEFAULT 'manual',  -- 'registry', 'referral', 'inbound', 'manual'
  lead_stage text NOT NULL DEFAULT 'new',       -- 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'
  lead_priority text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  assigned_to uuid,                             -- admin user handling
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  last_contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_leads_stage ON public.sales_leads(lead_stage);
CREATE INDEX idx_sales_leads_priority ON public.sales_leads(lead_priority);

ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales leads" ON public.sales_leads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Campaigns: marketing outreach tracking
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  campaign_type text NOT NULL DEFAULT 'email',  -- 'email', 'sms', 'whatsapp', 'multi'
  status text NOT NULL DEFAULT 'draft',          -- 'draft', 'scheduled', 'active', 'paused', 'completed'
  target_audience text,                          -- 'all_distributors', 'sebi_rias', 'custom', etc.
  target_count integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  conversion_count integer DEFAULT 0,
  content jsonb DEFAULT '{}'::jsonb,             -- template, subject, body
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Support Tickets
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  subject text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',  -- 'general', 'bug', 'account', 'billing', 'feature_request'
  priority text NOT NULL DEFAULT 'medium',    -- 'low', 'medium', 'high', 'urgent'
  status text NOT NULL DEFAULT 'open',        -- 'open', 'in_progress', 'waiting', 'resolved', 'closed'
  assigned_to uuid,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER set_registry_entities_updated_at BEFORE UPDATE ON public.registry_entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_invitations_updated_at BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_sales_leads_updated_at BEFORE UPDATE ON public.sales_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
