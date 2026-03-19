-- Allow users to insert their own non-admin roles (needed for onboarding)
CREATE POLICY "Users can insert own non-admin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('investor', 'intermediary', 'issuer')
);

-- Allow users to delete their own non-admin roles
CREATE POLICY "Users can delete own non-admin roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND role IN ('investor', 'intermediary', 'issuer')
);