ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_tiers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_users_self_read ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin_all_select ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin_all_insert ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin_all_update ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin_all_delete ON public.admin_users;
DROP POLICY IF EXISTS battle_pass_tiers_public_read ON public.battle_pass_tiers;
DROP POLICY IF EXISTS battle_pass_tiers_authenticated_read ON public.battle_pass_tiers;
DROP POLICY IF EXISTS battle_pass_tiers_admin_write ON public.battle_pass_tiers;

CREATE POLICY admin_users_self_read
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY admin_users_super_admin_all_select
ON public.admin_users
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users au
  WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
));

CREATE POLICY admin_users_super_admin_all_insert
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users au
  WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
));

CREATE POLICY admin_users_super_admin_all_update
ON public.admin_users
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users au
  WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users au
  WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
));

CREATE POLICY admin_users_super_admin_all_delete
ON public.admin_users
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users au
  WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
));

CREATE POLICY battle_pass_tiers_public_read
ON public.battle_pass_tiers
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY battle_pass_tiers_admin_write
ON public.battle_pass_tiers
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

INSERT INTO public.feature_flags (
  key,
  enabled,
  rollout_percentage,
  requires_auth,
  target_user_ids,
  target_user_segments
)
VALUES
  ('aiCoachEnabled', false, 0, true, '{}', '{}'),
  ('squadsEnabled', false, 0, true, '{}', '{}'),
  ('premiumEnabled', true, 100, true, '{}', '{}'),
  ('rewardsEnabled', true, 100, true, '{}', '{}')
ON CONFLICT (key) DO UPDATE SET
  enabled = excluded.enabled,
  rollout_percentage = excluded.rollout_percentage,
  requires_auth = excluded.requires_auth;

INSERT INTO public.liveops_config (key, value, value_type, description)
VALUES
  (
    'feature_flags_launch_ready',
    'true'::jsonb,
    'BOOLEAN',
    'Feature flag area uses live rollout emergency-disable data.'
  ),
  (
    'feature_flags_emergency_disable_supported',
    'true'::jsonb,
    'BOOLEAN',
    'Admin workflows can set emergency_disabled_at emergency_reason.'
  )
ON CONFLICT (key) DO UPDATE SET
  value = excluded.value,
  value_type = excluded.value_type,
  description = excluded.description;
