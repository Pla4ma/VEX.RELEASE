-- ============================================================================
-- Squad Wars
-- Weekly shared-boss competition for squads
-- ============================================================================

create table if not exists public.squad_wars (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  opponent_squad_id uuid references public.squads(id) on delete set null,
  boss_name text not null,
  boss_max_health integer not null check (boss_max_health > 0),
  boss_current_health integer not null check (boss_current_health >= 0),
  week_starts_at timestamptz not null,
  week_ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'victory', 'defeat', 'expired')),
  reward_multiplier numeric(3, 2) not null default 1.50,
  created_at timestamptz not null default now(),
  constraint squad_wars_valid_week check (week_ends_at > week_starts_at)
);

create index if not exists idx_squad_wars_squad_id on public.squad_wars(squad_id);
create index if not exists idx_squad_wars_active_week on public.squad_wars(status, week_ends_at);
create unique index if not exists idx_squad_wars_unique_squad_week
  on public.squad_wars(squad_id, week_starts_at);

create table if not exists public.squad_war_damage (
  id uuid primary key default gen_random_uuid(),
  war_id uuid not null references public.squad_wars(id) on delete cascade,
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  session_id uuid not null,
  damage integer not null check (damage > 0),
  created_at timestamptz not null default now(),
  constraint squad_war_damage_unique_session unique (user_id, session_id)
);

create index if not exists idx_squad_war_damage_war_id on public.squad_war_damage(war_id);
create index if not exists idx_squad_war_damage_squad_id on public.squad_war_damage(squad_id);
create index if not exists idx_squad_war_damage_user_id on public.squad_war_damage(user_id);

alter table public.squad_members add column if not exists is_active boolean not null default true;

alter table public.squad_wars enable row level security;
alter table public.squad_war_damage enable row level security;

drop policy if exists "Squad members can read their squad wars" on public.squad_wars;
create policy "Squad members can read their squad wars"
  on public.squad_wars
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.squad_members
      where squad_members.squad_id = squad_wars.squad_id
        and squad_members.user_id = auth.uid()
        and coalesce(squad_members.is_active, true)
    )
  );

drop policy if exists "Squad members can read their squad war damage" on public.squad_war_damage;
create policy "Squad members can read their squad war damage"
  on public.squad_war_damage
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.squad_members
      where squad_members.squad_id = squad_war_damage.squad_id
        and squad_members.user_id = auth.uid()
        and coalesce(squad_members.is_active, true)
    )
  );

drop policy if exists "Authenticated users can insert own squad war damage" on public.squad_war_damage;
create policy "Authenticated users can insert own squad war damage"
  on public.squad_war_damage
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.squad_members
      where squad_members.squad_id = squad_war_damage.squad_id
        and squad_members.user_id = auth.uid()
        and coalesce(squad_members.is_active, true)
    )
  );

create or replace function public.record_squad_war_damage(
  p_squad_id uuid,
  p_user_id uuid,
  p_damage integer,
  p_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_war_id uuid;
  v_inserted_id uuid;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'You can only record damage for your own user id';
  end if;

  if p_damage <= 0 then
    return;
  end if;

  if not exists (
    select 1
    from public.squad_members
    where squad_members.squad_id = p_squad_id
      and squad_members.user_id = p_user_id
      and coalesce(squad_members.is_active, true)
  ) then
    raise exception 'Only active squad members can record war damage';
  end if;

  select squad_wars.id
    into v_war_id
  from public.squad_wars
  where squad_wars.squad_id = p_squad_id
    and squad_wars.status = 'active'
    and squad_wars.week_starts_at <= now()
    and squad_wars.week_ends_at >= now()
  order by squad_wars.week_starts_at desc
  limit 1;

  if v_war_id is null then
    return;
  end if;

  insert into public.squad_war_damage (
    war_id,
    squad_id,
    user_id,
    session_id,
    damage
  )
  values (
    v_war_id,
    p_squad_id,
    p_user_id,
    p_session_id,
    p_damage
  )
  on conflict (user_id, session_id) do nothing
  returning id into v_inserted_id;

  if v_inserted_id is null then
    return;
  end if;

  update public.squad_wars
  set boss_current_health = greatest(0, boss_current_health - p_damage)
  where id = v_war_id;
end;
$$;

grant execute on function public.record_squad_war_damage(uuid, uuid, integer, uuid) to authenticated;

do $$
begin
  begin
    alter publication supabase_realtime add table public.squad_wars;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.squad_war_damage;
  exception
    when duplicate_object then null;
  end;
end;
$$;
