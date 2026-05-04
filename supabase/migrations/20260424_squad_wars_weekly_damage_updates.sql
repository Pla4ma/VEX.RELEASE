alter table public.squad_wars
  drop constraint if exists squad_wars_status_check;

alter table public.squad_wars
  add constraint squad_wars_status_check
  check (status in ('active', 'victory', 'defeat', 'expired', 'completed'));

alter table public.squad_war_damage
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.squad_war_damage
  drop constraint if exists squad_war_damage_unique_session;

alter table public.squad_war_damage
  add constraint squad_war_damage_unique_war_session unique (war_id, session_id);

drop function if exists public.record_squad_war_damage(uuid, uuid, integer, uuid, jsonb);

create or replace function public.record_squad_war_damage(
  p_squad_id uuid,
  p_user_id uuid,
  p_damage integer,
  p_session_id uuid,
  p_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_war_id uuid;
  v_previous_damage integer;
  v_effective_damage integer;
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

  select damage
    into v_previous_damage
  from public.squad_war_damage
  where war_id = v_war_id
    and session_id = p_session_id;

  v_effective_damage := greatest(coalesce(v_previous_damage, 0), p_damage);

  insert into public.squad_war_damage (
    war_id,
    squad_id,
    user_id,
    session_id,
    damage,
    metadata
  )
  values (
    v_war_id,
    p_squad_id,
    p_user_id,
    p_session_id,
    v_effective_damage,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (war_id, session_id) do update
    set squad_id = excluded.squad_id,
        user_id = excluded.user_id,
        damage = excluded.damage,
        metadata = excluded.metadata;

  update public.squad_wars
  set boss_current_health = greatest(
    0,
    boss_current_health - greatest(0, v_effective_damage - coalesce(v_previous_damage, 0))
  )
  where id = v_war_id;
end;
$$;

grant execute on function public.record_squad_war_damage(uuid, uuid, integer, uuid, jsonb)
  to authenticated;

create or replace function public.record_squad_war_damage(
  p_squad_id uuid,
  p_user_id uuid,
  p_damage integer,
  p_session_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  select public.record_squad_war_damage(
    p_squad_id,
    p_user_id,
    p_damage,
    p_session_id,
    '{}'::jsonb
  );
$$;

grant execute on function public.record_squad_war_damage(uuid, uuid, integer, uuid)
  to authenticated;
