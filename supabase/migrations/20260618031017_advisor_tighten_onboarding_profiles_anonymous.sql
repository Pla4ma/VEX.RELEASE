DROP POLICY IF EXISTS onboarding_profiles_owner_all ON public.onboarding_profiles;

CREATE POLICY onboarding_profiles_owner_all
ON public.onboarding_profiles
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
)
WITH CHECK (
  auth.uid() = user_id
  AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);
