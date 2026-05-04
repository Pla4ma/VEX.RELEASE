/**
 * Rivals Repository
 *
 * Supabase queries for rival matching, score tracking, and history.
 * @phase 4A
 */

import { supabase } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';
import type {
  RivalRelationship,
  RivalProfile,
  RivalHistoryEntry,
} from './schemas';
import { RivalRelationshipSchema } from './schemas';

/**
 * Table name for rival relationships
 */
const RIVALS_TABLE = 'rivals';
const debug = createDebugger('rivals:repository');

export interface RivalBaselineStats {
  level: number;
  sessionsPerWeek: number;
  avgSessionDuration: number;
  weeklyFocusMinutes: number;
}

/**
 * Create a new rival relationship
 */
export async function createRivalRelationship(
  challengerId: string,
  challengedId: string,
  weekStart: number
): Promise<RivalRelationship | null> {
  const { data, error } = await supabase
    .from(RIVALS_TABLE)
    .insert({
      challenger_id: challengerId,
      challenged_id: challengedId,
      week_start: weekStart,
      challenger_score: 0,
      challenged_score: 0,
      created_at: Date.now(),
    })
    .select()
    .single();

  if (error || !data) {
    if (error) {debug.error('Failed to create rival relationship', new Error(error.message));}
    return null;
  }

  return RivalRelationshipSchema.parse({
    id: data.id,
    challengerId: data.challenger_id,
    challengedId: data.challenged_id,
    weekStart: data.week_start,
    challengerScore: data.challenger_score,
    challengedScore: data.challenged_score,
    winnerId: data.winner_id,
    createdAt: data.created_at,
  });
}

/**
 * Get current rival for user
 */
export async function getCurrentRival(
  userId: string,
  weekStart: number
): Promise<RivalRelationship | null> {
  const { data, error } = await supabase
    .from(RIVALS_TABLE)
    .select('*')
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .eq('week_start', weekStart)
    .is('winner_id', null) // Not yet decided
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      // No rows returned
      debug.error('Failed to get current rival', new Error(error.message));
    }
    return null;
  }

  return RivalRelationshipSchema.parse({
    id: data.id,
    challengerId: data.challenger_id,
    challengedId: data.challenged_id,
    weekStart: data.week_start,
    challengerScore: data.challenger_score,
    challengedScore: data.challenged_score,
    winnerId: data.winner_id,
    createdAt: data.created_at,
  });
}

/**
 * Update rival scores
 */
export async function updateRivalScores(
  relationshipId: string,
  challengerScore: number,
  challengedScore: number
): Promise<boolean> {
  const { error } = await supabase
    .from(RIVALS_TABLE)
    .update({
      challenger_score: challengerScore,
      challenged_score: challengedScore,
    })
    .eq('id', relationshipId);

  if (error) {
    debug.error('Failed to update rival scores', new Error(error.message));
    return false;
  }

  return true;
}

/**
 * Mark winner and complete rivalry
 */
export async function completeRivalry(
  relationshipId: string,
  winnerId: string | null // null for draw
): Promise<boolean> {
  const { error } = await supabase
    .from(RIVALS_TABLE)
    .update({
      winner_id: winnerId,
    })
    .eq('id', relationshipId);

  if (error) {
    debug.error('Failed to complete rivalry', new Error(error.message));
    return false;
  }

  return true;
}

/**
 * Get rival history for user
 */
export async function getRivalHistory(
  userId: string,
  limit: number = 10
): Promise<RivalHistoryEntry[]> {
  const { data, error } = await supabase
    .from(RIVALS_TABLE)
    .select('*')
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .not('winner_id', 'is', null) // Completed rivalries
    .order('week_start', { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) {debug.error('Failed to get rival history', new Error(error.message));}
    return [];
  }

  return data.map((row) => {
    const isChallenger = row.challenger_id === userId;
    const myScore = isChallenger
      ? row.challenger_score
      : row.challenged_score;
    const theirScore = isChallenger
      ? row.challenged_score
      : row.challenger_score;
    const result =
      row.winner_id === null
        ? 'DRAW'
        : row.winner_id === userId
        ? 'WIN'
        : 'LOSS';

    return {
      weekStart: row.week_start,
      weekEnd: row.week_start + 7 * 24 * 60 * 60 * 1000,
      myScore,
      theirScore,
      result,
      rivalName: isChallenger ? row.challenged_name : row.challenger_name,
    };
  });
}

/**
 * Fetch candidate users for rival matching
 */
export async function fetchRivalCandidates(
  userId: string,
  minLevel: number,
  maxLevel: number
): Promise<RivalProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, level, sessions_per_week, avg_session_duration')
    .gte('level', minLevel)
    .lte('level', maxLevel)
    .neq('id', userId)
    .limit(50);

  if (error || !data) {
    if (error) {debug.error('Failed to fetch rival candidates', new Error(error.message));}
    return [];
  }

  return data.map((row) => ({
    userId: row.id,
    name: row.username,
    avatarUrl: row.avatar_url,
    level: row.level,
    sessionsPerWeek: row.sessions_per_week || 0,
    avgSessionDuration: row.avg_session_duration || 25,
  }));
}

export async function fetchRivalBaselineStats(userId: string): Promise<RivalBaselineStats> {
  const { data } = await supabase
    .from('profiles')
    .select('level, sessions_per_week, avg_session_duration')
    .eq('id', userId)
    .maybeSingle<{
      level: number | null;
      sessions_per_week: number | null;
      avg_session_duration: number | null;
    }>();

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const sessions = await supabase
    .from('sessions')
    .select('focus_minutes, duration_minutes, total_focus_time')
    .eq('user_id', userId)
    .gte('started_at', weekStart.toISOString())
    .returns<Array<{
      focus_minutes: number | null;
      duration_minutes: number | null;
      total_focus_time: number | null;
    }>>();

  const weeklyFocusMinutes = (sessions.data ?? []).reduce((total, session) => {
    if (typeof session.focus_minutes === 'number') {return total + session.focus_minutes;}
    if (typeof session.duration_minutes === 'number') {return total + session.duration_minutes;}
    if (typeof session.total_focus_time === 'number') {return total + Math.round(session.total_focus_time / 60);}
    return total;
  }, 0);

  return {
    level: data?.level ?? 1,
    sessionsPerWeek: data?.sessions_per_week ?? Math.max(1, sessions.data?.length ?? 0),
    avgSessionDuration: data?.avg_session_duration ?? 25,
    weeklyFocusMinutes,
  };
}

/**
 * Subscribe to rival score updates
 */
export function subscribeToRivalUpdates(
  relationshipId: string,
  onUpdate: (challengerScore: number, challengedScore: number) => void
) {
  const subscription = supabase
    .channel(`rival:${relationshipId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: RIVALS_TABLE,
        filter: `id=eq.${relationshipId}`,
      },
      (payload) => {
        onUpdate(
          payload.new.challenger_score,
          payload.new.challenged_score
        );
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
