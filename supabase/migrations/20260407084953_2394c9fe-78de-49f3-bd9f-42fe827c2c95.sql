
-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT DEFAULT '',
  website TEXT,
  industry TEXT DEFAULT 'Financial Services',
  entity_type TEXT DEFAULT 'company',
  registry_entity_id UUID REFERENCES public.registry_entities(id),
  claimed_by UUID,
  claimed_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  employee_count_range TEXT,
  founded_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Branches / office locations
CREATE TABLE public.org_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  branch_type TEXT NOT NULL DEFAULT 'branch',
  address_line TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  is_headquarters BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Departments within an org
CREATE TABLE public.org_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

-- Team members with verification status
CREATE TYPE public.org_member_status AS ENUM ('pending', 'verified', 'rejected', 'alumni');

CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  department_id UUID REFERENCES public.org_departments(id),
  branch_id UUID REFERENCES public.org_branches(id),
  designation TEXT NOT NULL DEFAULT '',
  employment_type TEXT DEFAULT 'full_time',
  status public.org_member_status NOT NULL DEFAULT 'pending',
  joined_at DATE,
  left_at DATE,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Indexes
CREATE INDEX idx_org_members_user ON public.org_members(user_id);
CREATE INDEX idx_org_members_org ON public.org_members(org_id);
CREATE INDEX idx_org_members_status ON public.org_members(status);
CREATE INDEX idx_org_branches_org ON public.org_branches(org_id);
CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Organizations: public read, claimed org admin can update
CREATE POLICY "Anyone can view organizations"
  ON public.organizations FOR SELECT
  USING (true);

CREATE POLICY "Org admin can update organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (claimed_by = auth.uid());

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Branches: public read, org admin can manage
CREATE POLICY "Anyone can view branches"
  ON public.org_branches FOR SELECT
  USING (true);

CREATE POLICY "Org admin can manage branches"
  ON public.org_branches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND claimed_by = auth.uid())
  );

CREATE POLICY "Org admin can update branches"
  ON public.org_branches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND claimed_by = auth.uid())
  );

CREATE POLICY "Org admin can delete branches"
  ON public.org_branches FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND claimed_by = auth.uid())
  );

-- Departments: public read, org admin can manage
CREATE POLICY "Anyone can view departments"
  ON public.org_departments FOR SELECT
  USING (true);

CREATE POLICY "Org admin can manage departments"
  ON public.org_departments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND claimed_by = auth.uid())
  );

CREATE POLICY "Org admin can update departments"
  ON public.org_departments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND claimed_by = auth.uid())
  );

CREATE POLICY "Org admin can delete departments"
  ON public.org_departments FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND claimed_by = auth.uid())
  );

-- Members: public read (verified only), user can claim, org admin can approve
CREATE POLICY "Anyone can view verified members"
  ON public.org_members FOR SELECT
  USING (status = 'verified' OR user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND claimed_by = auth.uid()));

CREATE POLICY "Authenticated users can claim membership"
  ON public.org_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Org admin can update members"
  ON public.org_members FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND claimed_by = auth.uid())
  );
