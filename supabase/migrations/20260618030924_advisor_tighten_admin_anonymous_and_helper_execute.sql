REVOKE EXECUTE ON FUNCTION public.is_admin_user()
  FROM public, anon, authenticated;

DROP POLICY IF EXISTS admin_users_self_read ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin_all_select ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin_all_insert ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin_all_update ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin_all_delete ON public.admin_users;
DROP POLICY IF EXISTS battle_pass_tiers_admin_write ON public.battle_pass_tiers;

CREATE POLICY admin_users_self_read
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

CREATE POLICY admin_users_super_admin_all_select
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  AND EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
  )
);

CREATE POLICY admin_users_super_admin_all_insert
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
  COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  AND EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
  )
);

CREATE POLICY admin_users_super_admin_all_update
ON public.admin_users
FOR UPDATE
TO authenticated
USING (
  COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  AND EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
  )
)
WITH CHECK (
  COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  AND EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
  )
);

CREATE POLICY admin_users_super_admin_all_delete
ON public.admin_users
FOR DELETE
TO authenticated
USING (
  COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  AND EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
  )
);

CREATE POLICY battle_pass_tiers_admin_write
ON public.battle_pass_tiers
FOR ALL
TO authenticated
USING (
  COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  AND public.is_admin_user()
)
WITH CHECK (
  COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  AND public.is_admin_user()
);
