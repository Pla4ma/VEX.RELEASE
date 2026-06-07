/**
 * Monthly Focus Report Repository
 *
 * All Supabase data-access logic for monthly focus reports.
 * This is the ONLY file that speaks to Supabase for this feature.
 */

import { getSupabaseClient } from '../../../config/supabase';
import { RepositoryError } from '../../../lib/repository/error-handling';

const supabase = getSupabaseClient();

export interface FocusScoreRow {
  score: number;
}

export interface SessionRow {
  id: string;
  user_id: string;
  completed_at: string;
  duration_minutes: number;
  grade: string;
  focus_purity_score: number;
  status: string;
}

export async function fetchStartScore(
  userId: string,
  startDateIso: string,
): Promise<FocusScoreRow | null> {
  const { data, error } = await supabase
    .from('focus_scores')
    .select('score')
    .eq('user_id', userId)
    .lte('created_at', startDateIso)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data ? ({ score: data.score } satisfies FocusScoreRow) : null;
}

export async function fetchEndScore(
  userId: string,
  startDateIso: string,
  endDateIso: string,
): Promise<FocusScoreRow | null> {
  const { data, error } = await supabase
    .from('focus_scores')
    .select('score')
    .eq('user_id', userId)
    .gte('created_at', startDateIso)
    .lte('created_at', endDateIso)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data ? ({ score: data.score } satisfies FocusScoreRow) : null;
}

export async function fetchSessionsForMonth(
  userId: string,
  startDateIso: string,
  endDateIso: string,
): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id,user_id,completed_at,duration_minutes,grade,focus_purity_score,status')
    .eq('user_id', userId)
    .gte('completed_at', startDateIso)
    .lte('completed_at', endDateIso)
    .eq('status', 'COMPLETED');

  if (error) {
    throw new RepositoryError('fetchSessionsForMonth', error);
  }

  return (data ?? []) as SessionRow[];
}
