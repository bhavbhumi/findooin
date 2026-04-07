
-- Fix overly permissive INSERT on organizations
DROP POLICY "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (claimed_by = auth.uid() OR claimed_by IS NULL);

-- Fix overly permissive INSERT on org_members (already correct but re-state clearly)
DROP POLICY "Authenticated users can claim membership" ON public.org_members;
CREATE POLICY "Authenticated users can claim membership"
  ON public.org_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
