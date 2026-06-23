create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('voice', 'photo', 'link', 'braindump')),
  content text not null check (char_length(content) between 1 and 10000),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.plan_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text check (description is null or char_length(description) <= 500),
  color text,
  icon text,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  progress integer not null default 0 check (progress between 0 and 100),
  item_count integer not null default 0 check (item_count >= 0),
  completed_item_count integer not null default 0 check (completed_item_count >= 0),
  lane text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  subject text not null check (char_length(subject) between 1 and 100),
  description text check (description is null or char_length(description) <= 500),
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  progress integer not null default 0 check (progress between 0 and 100),
  target_date timestamptz,
  item_count integer not null default 0 check (item_count >= 0),
  completed_item_count integer not null default 0 check (completed_item_count >= 0),
  lane text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text check (description is null or char_length(description) <= 1000),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'blocked')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  project_id uuid references public.plan_projects(id) on delete set null,
  study_plan_id uuid references public.plan_study_plans(id) on delete set null,
  due_date timestamptz,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 1 and 480),
  completed_at timestamptz,
  tags text[] not null default '{}'::text[],
  lane text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_items_single_parent check (project_id is null or study_plan_id is null)
);

create index if not exists captures_user_created_idx on public.captures(user_id, created_at desc);
create index if not exists plan_projects_user_created_idx on public.plan_projects(user_id, created_at desc);
create index if not exists plan_study_plans_user_created_idx on public.plan_study_plans(user_id, created_at desc);
create index if not exists plan_items_user_created_idx on public.plan_items(user_id, created_at desc);
create index if not exists plan_items_project_idx on public.plan_items(project_id) where project_id is not null;
create index if not exists plan_items_study_plan_idx on public.plan_items(study_plan_id) where study_plan_id is not null;

create or replace function public.set_current_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plan_projects_set_updated_at on public.plan_projects;
create trigger plan_projects_set_updated_at
  before update on public.plan_projects
  for each row execute function public.set_current_updated_at();

drop trigger if exists plan_study_plans_set_updated_at on public.plan_study_plans;
create trigger plan_study_plans_set_updated_at
  before update on public.plan_study_plans
  for each row execute function public.set_current_updated_at();

drop trigger if exists plan_items_set_updated_at on public.plan_items;
create trigger plan_items_set_updated_at
  before update on public.plan_items
  for each row execute function public.set_current_updated_at();

alter table public.captures enable row level security;
alter table public.plan_projects enable row level security;
alter table public.plan_study_plans enable row level security;
alter table public.plan_items enable row level security;

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
