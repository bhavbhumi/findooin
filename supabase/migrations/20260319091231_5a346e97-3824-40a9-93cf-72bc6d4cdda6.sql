
-- Security Incidents table
CREATE TABLE public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'mitigated', 'resolved', 'closed')),
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('data_breach', 'unauthorized_access', 'malware', 'phishing', 'ddos', 'vulnerability', 'policy_violation', 'other')),
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  affected_systems TEXT[] DEFAULT '{}',
  impact_assessment TEXT,
  resolution_notes TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security incidents"
ON public.security_incidents FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Compliance items table
CREATE TABLE public.compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework TEXT NOT NULL DEFAULT 'internal' CHECK (framework IN ('soc2', 'iso27001', 'gdpr', 'dpdp', 'sebi', 'pci_dss', 'internal')),
  control_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'implemented', 'verified', 'non_compliant')),
  evidence_url TEXT,
  owner TEXT,
  review_date DATE,
  next_review_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage compliance items"
ON public.compliance_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Security alerts table
CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL DEFAULT 'info' CHECK (alert_type IN ('critical', 'warning', 'info', 'resolved')),
  source TEXT NOT NULL DEFAULT 'system' CHECK (source IN ('system', 'vapt', 'monitoring', 'user_report', 'automated_scan')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  related_incident_id UUID REFERENCES public.security_incidents(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security alerts"
ON public.security_alerts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- VAPT scan results table
CREATE TABLE public.vapt_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL DEFAULT 'automated' CHECK (scan_type IN ('automated', 'manual', 'penetration_test', 'vulnerability_assessment')),
  scanner_name TEXT NOT NULL DEFAULT 'internal',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'running', 'completed', 'failed')),
  findings_critical INT NOT NULL DEFAULT 0,
  findings_high INT NOT NULL DEFAULT 0,
  findings_medium INT NOT NULL DEFAULT 0,
  findings_low INT NOT NULL DEFAULT 0,
  findings_info INT NOT NULL DEFAULT 0,
  report_url TEXT,
  summary TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  conducted_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vapt_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage vapt scans"
ON public.vapt_scans FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for common queries
CREATE INDEX idx_security_incidents_status ON public.security_incidents(status);
CREATE INDEX idx_security_incidents_severity ON public.security_incidents(severity);
CREATE INDEX idx_security_alerts_type ON public.security_alerts(alert_type);
CREATE INDEX idx_security_alerts_ack ON public.security_alerts(is_acknowledged);
CREATE INDEX idx_compliance_items_framework ON public.compliance_items(framework);
CREATE INDEX idx_compliance_items_status ON public.compliance_items(status);
CREATE INDEX idx_vapt_scans_status ON public.vapt_scans(status);

-- Triggers for updated_at
CREATE TRIGGER update_security_incidents_updated_at
  BEFORE UPDATE ON public.security_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_compliance_items_updated_at
  BEFORE UPDATE ON public.compliance_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
