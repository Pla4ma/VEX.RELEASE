drop policy if exists "captures owner select" on public.captures;
drop policy if exists "captures owner insert" on public.captures;
drop policy if exists "captures owner update" on public.captures;
drop policy if exists "captures owner delete" on public.captures;

create policy "captures owner select" on public.captures
  for select to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "captures owner insert" on public.captures
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "captures owner update" on public.captures
  for update to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  ) with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "captures owner delete" on public.captures
  for delete to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists "plan projects owner select" on public.plan_projects;
drop policy if exists "plan projects owner insert" on public.plan_projects;
drop policy if exists "plan projects owner update" on public.plan_projects;
drop policy if exists "plan projects owner delete" on public.plan_projects;

create policy "plan projects owner select" on public.plan_projects
  for select to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan projects owner insert" on public.plan_projects
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan projects owner update" on public.plan_projects
  for update to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  ) with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan projects owner delete" on public.plan_projects
  for delete to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists "plan study plans owner select" on public.plan_study_plans;
drop policy if exists "plan study plans owner insert" on public.plan_study_plans;
drop policy if exists "plan study plans owner update" on public.plan_study_plans;
drop policy if exists "plan study plans owner delete" on public.plan_study_plans;

create policy "plan study plans owner select" on public.plan_study_plans
  for select to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan study plans owner insert" on public.plan_study_plans
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan study plans owner update" on public.plan_study_plans
  for update to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  ) with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan study plans owner delete" on public.plan_study_plans
  for delete to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists "plan items owner select" on public.plan_items;
drop policy if exists "plan items owner insert" on public.plan_items;
drop policy if exists "plan items owner update" on public.plan_items;
drop policy if exists "plan items owner delete" on public.plan_items;

create policy "plan items owner select" on public.plan_items
  for select to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan items owner insert" on public.plan_items
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan items owner update" on public.plan_items
  for update to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  ) with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "plan items owner delete" on public.plan_items
  for delete to authenticated using (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

