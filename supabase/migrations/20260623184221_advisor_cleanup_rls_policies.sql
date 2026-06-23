create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.role in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_admin_user() from public;
revoke all on function public.is_admin_user() from anon;
revoke all on function public.is_admin_user() from authenticated;
grant execute on function public.is_admin_user() to service_role;

drop policy if exists admin_users_self_read on public.admin_users;
drop policy if exists admin_users_super_admin_all_select on public.admin_users;
drop policy if exists admin_users_super_admin_all_insert on public.admin_users;
drop policy if exists admin_users_super_admin_all_update on public.admin_users;
drop policy if exists admin_users_super_admin_all_delete on public.admin_users;

create policy admin_users_owner_or_super_admin_select on public.admin_users
  for select to authenticated
  using (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and (
      user_id = (select auth.uid())
      or exists (
        select 1
        from public.admin_users au
        where au.user_id = (select auth.uid())
          and au.role = 'super_admin'
      )
    )
  );

create policy admin_users_super_admin_insert on public.admin_users
  for insert to authenticated
  with check (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = (select auth.uid())
        and au.role = 'super_admin'
    )
  );

create policy admin_users_super_admin_update on public.admin_users
  for update to authenticated
  using (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = (select auth.uid())
        and au.role = 'super_admin'
    )
  )
  with check (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = (select auth.uid())
        and au.role = 'super_admin'
    )
  );

create policy admin_users_super_admin_delete on public.admin_users
  for delete to authenticated
  using (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = (select auth.uid())
        and au.role = 'super_admin'
    )
  );

drop policy if exists battle_pass_tiers_admin_write on public.battle_pass_tiers;

create policy battle_pass_tiers_admin_insert on public.battle_pass_tiers
  for insert to authenticated
  with check (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and (select public.is_admin_user())
  );

create policy battle_pass_tiers_admin_update on public.battle_pass_tiers
  for update to authenticated
  using (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and (select public.is_admin_user())
  )
  with check (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and (select public.is_admin_user())
  );

create policy battle_pass_tiers_admin_delete on public.battle_pass_tiers
  for delete to authenticated
  using (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
    and (select public.is_admin_user())
  );

drop policy if exists onboarding_profiles_owner_all on public.onboarding_profiles;
create policy onboarding_profiles_owner_all on public.onboarding_profiles
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  )
  with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
