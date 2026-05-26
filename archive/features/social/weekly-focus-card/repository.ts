import { getSupabaseClient } from '../../../config/supabase';
import type { Database } from '../../../types/supabase';

type SessionsRow = Database['public']['Tables']['sessions']['Row'];
type StreaksRow = Database['public']['Tables']['streaks']['Row'];
type FocusScoresRow = Database['public']['Tables']['focus_scores']['Row'];

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`);
    this.name = 'RepositoryError';
  }
}

const supabase = getSupabaseClient();

function isNoRowsError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'PGRST116'
  );
}

interface WeekRange {
  start: Date;
  end: Date;
}

function getWeekRange(weekOffset: number): WeekRange {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff - weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export async function fetchWeeklySessions(
  userId: string,
  weekOffset: number
): Promise<SessionsRow[]> {
  const { start, end } = getWeekRange(weekOffset);
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'COMPLETED')
    .gte('completed_at', start.toISOString())
    .lte('completed_at', end.toISOString())
    .order('completed_at', { ascending: false });

  if (error) {
    throw new RepositoryError('fetchWeeklySessions', error);
  }

  return data ?? [];
}

export async function fetchStreak(userId: string): Promise<StreaksRow | null> {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) {
    if (isNoRowsError(error)) {
      return null;
    }
    throw new RepositoryError('fetchStreak', error);
  }

  return data;
}

export async function fetchLatestFocusScore(
  userId: string
): Promise<FocusScoresRow | null> {
  const { data, error } = await supabase
    .from('focus_scores')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (isNoRowsError(error)) {
      return null;
    }
    throw new RepositoryError('fetchLatestFocusScore', error);
  }

  return data;
}

export async function fetchPreviousWeekFocusScore(
  userId: string,
  weekOffset: number
): Promise<FocusScoresRow | null> {
  const { start } = getWeekRange(weekOffset + 1);
  const previousWeekEnd = new Date(start);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);

  const { data, error } = await supabase
    .from('focus_scores')
    .select('*')
    .eq('user_id', userId)
    .lte('created_at', previousWeekEnd.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (isNoRowsError(error)) {
      return null;
    }
    throw new RepositoryError('fetchPreviousWeekFocusScore', error);
  }

  return data;
}
