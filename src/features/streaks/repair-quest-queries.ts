import { RepositoryError } from '../../lib/repository/error-handling';
import { supabase } from './repository-helpers';

export async function fetchActiveRepairQuest(
  userId: string,
): Promise<{
  id: string;
  userId: string;
  previousStreak: number;
  targetRestoreDays: number;
  sessionsCompleted: number;
  sessionsRequired: number;
  startedAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'ABANDONED';
  sessionIds: string[];
  completedAt: number | null;
} | null> {
  const { data, error } = await supabase
    .from('streak_repair_quests')
    .select('id,user_id,previous_streak,target_restore_days,sessions_completed,sessions_required,started_at,expires_at,status,session_ids,completed_at')
    .eq('status', 'ACTIVE')
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchActiveRepairQuest', error);
  }
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    userId: data.user_id,
    previousStreak: data.previous_streak,
    targetRestoreDays: data.target_restore_days,
    sessionsCompleted: data.sessions_completed,
    sessionsRequired: data.sessions_required,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
    status:
      data.status === 'COMPLETED' ||
      data.status === 'EXPIRED' ||
      data.status === 'ABANDONED'
        ? data.status
        : 'ACTIVE',
    sessionIds: data.session_ids || [],
    completedAt: data.completed_at ?? null,
  };
}

export async function saveRepairQuest(quest: {
  id: string;
  userId: string;
  previousStreak: number;
  targetRestoreDays: number;
  sessionsCompleted: number;
  sessionsRequired: number;
  startedAt: number;
  expiresAt: number;
  status: string;
  sessionIds: string[];
}): Promise<void> {
  const { error } = await supabase
    .from('streak_repair_quests')
    .insert({
      id: quest.id,
      user_id: quest.userId,
      previous_streak: quest.previousStreak,
      target_restore_days: quest.targetRestoreDays,
      sessions_completed: quest.sessionsCompleted,
      sessions_required: quest.sessionsRequired,
      started_at: quest.startedAt,
      expires_at: quest.expiresAt,
      status: quest.status,
      session_ids: quest.sessionIds,
    });
  if (error) {
    throw new RepositoryError('saveRepairQuest', error);
  }
}

export async function updateRepairQuest(
  userId: string,
  questId: string,
  updates: {
    sessionsCompleted?: number;
    sessionIds?: string[];
    status?: string;
    completedAt?: number;
  },
): Promise<void> {
  const { error } = await supabase
    .from('streak_repair_quests')
    .update({
      sessions_completed: updates.sessionsCompleted,
      session_ids: updates.sessionIds,
      status: updates.status,
      completed_at: updates.completedAt,
      updated_at: Date.now(),
    })
    .eq('id', questId)
    .eq('user_id', userId);
  if (error) {
    throw new RepositoryError('updateRepairQuest', error);
  }
}

export async function fetchExpiredRepairQuests(): Promise<
  Array<{
    id: string;
    userId: string;
    previousStreak: number;
    status: string;
    expiresAt: number;
  }>
> {
  const { data, error } = await supabase
    .from('streak_repair_quests')
    .select('id, user_id, previous_streak, status, expires_at')
    .eq('status', 'ACTIVE')
    .lt('expires_at', Date.now());
  if (error) {
    throw new RepositoryError('fetchExpiredRepairQuests', error);
  }
  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    userId: row.user_id as string,
    previousStreak: row.previous_streak as number,
    status: row.status as string,
    expiresAt: row.expires_at as number,
  }));
}

export async function fetchUsersWithActiveStreaks(): Promise<string[]> {
  const { data, error } = await supabase
    .from('streaks')
    .select('user_id')
    .gt('current_days', 0);
  if (error) {
    throw new RepositoryError('fetchUsersWithActiveStreaks', error);
  }
  return (data || []).map((row: { user_id: string }) => row.user_id);
}
