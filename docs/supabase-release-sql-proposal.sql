-- VEX OFFICIAL release SQL proposal.
-- Project: icnbpjkyupuqzuvwuvbk
-- Review before applying. This file has not been run against Supabase.

begin;

-- 1) Admin-only helper used by RLS policies.
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.role in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

-- 2) Enable RLS on flagged admin tables.
alter table public.admin_users enable row level security;
alter table public.battle_pass_tiers enable row level security;

drop policy if exists admin_users_self_read on public.admin_users;
drop policy if exists admin_users_super_admin_all on public.admin_users;
drop policy if exists battle_pass_tiers_public_read on public.battle_pass_tiers;
drop policy if exists battle_pass_tiers_admin_write on public.battle_pass_tiers;

create policy admin_users_self_read
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

create policy admin_users_super_admin_all_select
  on public.admin_users
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
        and au.role = 'super_admin'
    )
  );

create policy admin_users_super_admin_all_insert
  on public.admin_users
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
        and au.role = 'super_admin'
    )
  );

create policy admin_users_super_admin_all_update
  on public.admin_users
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
        and au.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
        and au.role = 'super_admin'
    )
  );

create policy admin_users_super_admin_all_delete
  on public.admin_users
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
        and au.role = 'super_admin'
    )
  );

create policy battle_pass_tiers_public_read
  on public.battle_pass_tiers
  for select
  to anon, authenticated
  using (true);

create policy battle_pass_tiers_admin_write
  on public.battle_pass_tiers
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- 3) Launch flags. Inserts missing only.
insert into public.feature_flags (
  key,
  enabled,
  rollout_percentage,
  requires_auth,
  target_user_ids,
  target_user_segments
)
values
  ('aiCoachEnabled', false, 0, true, '{}', '{}'),
  ('squadsEnabled', false, 0, true, '{}', '{}'),
  ('premiumEnabled', true, 100, true, '{}', '{}'),
  ('rewardsEnabled', true, 100, true, '{}', '{}')
on conflict (key) do nothing;

insert into public.liveops_config (
  key,
  value,
  value_type,
  description
)
values
  ('feature_flags_launch_ready', 'true'::jsonb, 'boolean', 'Feature flag area uses live rollout and emergency-disable data.'),
  ('feature_flags_emergency_disable_supported', 'true'::jsonb, 'boolean', 'Admin workflows can set emergency_disabled_at and emergency_reason.')
on conflict (key) do nothing;

commit;
