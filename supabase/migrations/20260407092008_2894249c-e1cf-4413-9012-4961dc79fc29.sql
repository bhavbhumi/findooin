
-- Team affiliations: individuals claim membership at entity profiles
CREATE TYPE public.affiliation_status AS ENUM ('pending', 'verified', 'rejected', 'departed');

CREATE TABLE public.team_affiliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  designation TEXT NOT NULL DEFAULT '',
  department TEXT,
  branch_location TEXT,
  status affiliation_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  departed_at TIMESTAMPTZ,
  UNIQUE(user_id, entity_profile_id)
);

ALTER TABLE public.team_affiliations ENABLE ROW LEVEL SECURITY;

-- Entity locations: custom locations managed by entity admin (beyond registry data)
CREATE TABLE public.entity_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_type TEXT NOT NULL DEFAULT 'branch',
  label TEXT NOT NULL DEFAULT '',
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  is_headquarters BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.entity_locations ENABLE ROW LEVEL SECURITY;

-- Security definer function: check if user is the entity admin
CREATE OR REPLACE FUNCTION public.is_entity_admin(_user_id UUID, _entity_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _entity_profile_id
    AND id = _user_id
    AND user_type = 'entity'
  );
$$;

-- Security definer function: check if user has a verified affiliation at an entity
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _entity_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_affiliations
    WHERE user_id = _user_id
    AND entity_profile_id = _entity_profile_id
    AND status = 'verified'
  );
$$;

-- RLS: team_affiliations
CREATE POLICY "Anyone can view verified affiliations"
  ON public.team_affiliations FOR SELECT
  USING (status = 'verified' OR user_id = auth.uid() OR public.is_entity_admin(auth.uid(), entity_profile_id));

CREATE POLICY "Authenticated users can request affiliation"
  ON public.team_affiliations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Entity admin can update affiliations"
  ON public.team_affiliations FOR UPDATE
  TO authenticated
  USING (public.is_entity_admin(auth.uid(), entity_profile_id) OR user_id = auth.uid());

CREATE POLICY "User or entity admin can delete affiliation"
  ON public.team_affiliations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_entity_admin(auth.uid(), entity_profile_id));

-- RLS: entity_locations
CREATE POLICY "Anyone can view entity locations"
  ON public.entity_locations FOR SELECT
  USING (true);

CREATE POLICY "Entity admin can manage locations"
  ON public.entity_locations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_entity_admin(auth.uid(), entity_profile_id));

CREATE POLICY "Entity admin can update locations"
  ON public.entity_locations FOR UPDATE
  TO authenticated
  USING (public.is_entity_admin(auth.uid(), entity_profile_id));

CREATE POLICY "Entity admin can delete locations"
  ON public.entity_locations FOR DELETE
  TO authenticated
  USING (public.is_entity_admin(auth.uid(), entity_profile_id));
