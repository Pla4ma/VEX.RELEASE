import { getSupabaseClient } from '../../config/supabase';
import {
  RecordSquadWarDamageInputSchema,
  SquadWarMemberStatusSchema,
  SquadWarSchema,
} from './schemas';
import type { SquadWar, SquadWarMemberStatus } from './squad-war-types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('squads:war-repository');

const supabase = getSupabaseClient();

class SquadWarRepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(
      `Squad war repository error in ${operation}: ${
        originalError instanceof Error ? originalError.message : 'Unknown error'
      }`
    );
    this.name = 'SquadWarRepositoryError';
  }
}

type SquadWarRow = {
  id: string;
  squad_id: string;
  opponent_squad_id: string | null;
  boss_name: string;
  boss_max_health: number;
  boss_current_health: number;
  week_starts_at: string;
  week_ends_at: string;
  status: SquadWar['status'];
  reward_multiplier: number;
};

type SquadMemberRow = {
  user_id: string;
  users?: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    last_active_at?: string | number | null;
  } | null;
};

type SquadWarDamageRow = {
  user_id: string;
  damage: number;
};

type ActiveSquadSessionRow = {
  user_id: string;
  status?: string | null;
  squad_sessions?: {
    status?: string | null;
    started_at?: string | null;
    squad_id?: string | null;
  } | null;
};

function parseTimestamp(value: string | number | null | undefined): number | null {
  if (value == null) {return null;}
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildDisplayName(row: SquadMemberRow): string {
  const displayName = row.users?.display_name?.trim();
  if (displayName) {return displayName;}

  const firstName = row.users?.first_name?.trim();
  const lastName = row.users?.last_name?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (fullName) {return fullName;}

  const username = row.users?.username?.trim();
  if (username) {return username;}

  return 'Squadmate';
}

async function fetchSquadWarMembers(
  squadId: string,
  warId: string
): Promise<SquadWarMemberStatus[]> {
  const [membersResult, damageResult, sessionsResult] = await Promise.all([
    supabase
      .from('squad_members')
      .select(
        `
          user_id,
          users:user_id (
            display_name,
            first_name,
            last_name,
            username,
            last_active_at
          )
        `
      )
      .eq('squad_id', squadId)
      .eq('is_active', true)
      .order('joined_at', { ascending: true }),
    supabase
      .from('squad_war_damage')
      .select('user_id, damage')
      .eq('war_id', warId),
    supabase
      .from('squad_session_participants')
      .select(
        `
          user_id,
          status,
          squad_sessions:session_id!inner (
            status,
            started_at,
            squad_id
          )
        `
      )
      .eq('squad_sessions.squad_id', squadId)
      .eq('squad_sessions.status', 'ACTIVE')
      .in('status', ['JOINED', 'ACTIVE', 'PAUSED']),
  ]);

  if (membersResult.error) {
    throw new SquadWarRepositoryError('fetchSquadWarMembers.members', membersResult.error);
  }
  if (damageResult.error) {
    throw new SquadWarRepositoryError('fetchSquadWarMembers.damage', damageResult.error);
  }
  if (sessionsResult.error) {
    throw new SquadWarRepositoryError('fetchSquadWarMembers.sessions', sessionsResult.error);
  }

  const damageByUser = new Map<string, number>();
  for (const row of (damageResult.data ?? []) as SquadWarDamageRow[]) {
    damageByUser.set(row.user_id, (damageByUser.get(row.user_id) ?? 0) + (row.damage ?? 0));
  }

  const focusingByUser = new Map<string, number | null>();
  for (const row of (sessionsResult.data ?? []) as ActiveSquadSessionRow[]) {
    if (!focusingByUser.has(row.user_id)) {
      focusingByUser.set(row.user_id, parseTimestamp(row.squad_sessions?.started_at ?? null));
    }
  }

  return ((membersResult.data ?? []) as SquadMemberRow[]).map((row) => {
    const member: SquadWarMemberStatus = {
      userId: row.user_id,
      displayName: buildDisplayName(row),
      isCurrentlyFocusing: focusingByUser.has(row.user_id),
      sessionStartedAt: focusingByUser.get(row.user_id) ?? null,
      damageContributed: damageByUser.get(row.user_id) ?? 0,
      lastSeenAt: parseTimestamp(row.users?.last_active_at ?? null) ?? Date.now(),
    };
    SquadWarMemberStatusSchema.parse(member);

    return member;
  });
}

function mapSquadWar(
  row: SquadWarRow,
  members: SquadWarMemberStatus[]
): SquadWar {
  const war: SquadWar = {
    id: row.id,
    squadId: row.squad_id,
    opponentSquadId: row.opponent_squad_id,
    bossName: row.boss_name,
    bossMaxHealth: row.boss_max_health,
    bossCurrentHealth: row.boss_current_health,
    weekStartsAt: row.week_starts_at,
    weekEndsAt: row.week_ends_at,
    members,
    status: row.status,
    rewardMultiplier: row.reward_multiplier,
  };
  SquadWarSchema.parse(war);

  return war;
}

export async function getActiveSquadWar(squadId: string): Promise<SquadWar | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('squad_wars')
    .select('*')
    .eq('squad_id', squadId)
    .lte('week_starts_at', now)
    .gte('week_ends_at', now)
    .neq('status', 'expired')
    .order('week_starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new SquadWarRepositoryError('getActiveSquadWar', error);
  }

  if (!data) {
    return null;
  }

  const war = data as SquadWarRow;
  const members = await fetchSquadWarMembers(squadId, war.id);
  return mapSquadWar(war, members);
}

export function subscribeToSquadWar(
  squadId: string,
  onUpdate: (war: SquadWar) => void
): () => void {
  const channel = supabase
    .channel(`squad-war:${squadId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'squad_wars',
      },
      async (payload: { new?: { squad_id?: string }; old?: { squad_id?: string } }) => {
        const changedSquadId = payload.new?.squad_id ?? payload.old?.squad_id;
        if (changedSquadId && changedSquadId !== squadId) {
          return;
        }

        try {
          const war = await getActiveSquadWar(squadId);
          if (war) {
            onUpdate(war);
          }
        } catch (subscriptionError) {
          debug.warn('[SquadWar] Failed to refresh realtime state', subscriptionError as Error);
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

export async function fetchWarLeaderboard(warId: string): Promise<SquadWarDamageRow[]> {
  const { data, error } = await supabase
    .from('squad_war_damage')
    .select('user_id, damage')
    .eq('war_id', warId);

  if (error) {
    throw new SquadWarRepositoryError('fetchWarLeaderboard', error);
  }

  // Aggregate damage by user
  const damageByUser = new Map<string, number>();
  for (const row of (data ?? []) as SquadWarDamageRow[]) {
    damageByUser.set(row.user_id, (damageByUser.get(row.user_id) ?? 0) + (row.damage ?? 0));
  }

  return Array.from(damageByUser.entries()).map(([user_id, damage]) => ({ user_id, damage }));
}

export function subscribeToSquadWarDamage(
  warId: string,
  onUpdate: (damage: SquadWarDamageRow[]) => void
): () => void {
  const subscription = supabase
    .channel(`squad_war_damage:${warId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'squad_war_damage',
        filter: `war_id=eq.${warId}`,
      },
      () => {
        // Re-fetch on any change rather than trying to merge incremental updates
        fetchWarLeaderboard(warId).then(onUpdate).catch(() => {});
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

export async function recordWarDamage(input: {
  squadId: string;
  userId: string;
  damage: number;
  sessionId: string;
}): Promise<void> {
  const validatedInput: {
    squadId: string;
    userId: string;
    damage: number;
    sessionId: string;
  } = {
    ...input,
    damage: Math.max(0, Math.floor(input.damage)),
  };
  RecordSquadWarDamageInputSchema.parse(validatedInput);
  const sanitizedDamage = validatedInput.damage;
  if (sanitizedDamage <= 0) {
    return;
  }

  const { error } = await supabase.rpc('record_squad_war_damage', {
    p_squad_id: validatedInput.squadId,
    p_user_id: validatedInput.userId,
    p_damage: sanitizedDamage,
    p_session_id: validatedInput.sessionId,
  });

  if (error) {
    throw new SquadWarRepositoryError('recordWarDamage', error);
  }
}
