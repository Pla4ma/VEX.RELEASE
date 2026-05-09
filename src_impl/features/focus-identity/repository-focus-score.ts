import { getSupabaseClient } from '../../config/supabase';
import type { FocusScoreHistoryPoint, FocusScoreRecord } from './types';
import {
  AppendFocusScoreHistoryEventSchema,
  CurrentFocusScoreRowSchema,
  FocusScoreHistoryRowSchema,
  MonthInputSchema,
  MonthlyFocusReportInputSchema,
  type AppendFocusScoreHistoryEvent,
  type MonthlyFocusReportInput,
  type UpsertCurrentFocusScoreInput,
  UpsertCurrentFocusScoreInputSchema,
} from './repository-focus-score.schemas';
import { createDebugger } from '../../utils/debug';
import { withResilience } from '../../utils/supabase-resilience';

const debug = createDebugger('focus-identity:repository');

export type { MonthlyFocusReportInput } from './repository-focus-score.schemas';

export class FocusIdentityRepositoryError extends Error {
  constructor(
    public operation: string,
    public cause: unknown,
  ) {
    super(
      `Focus identity repository failed during ${operation}: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = 'FocusIdentityRepositoryError';
  }
}

function mapCurrentRowToRecord(row: unknown): FocusScoreRecord {
  const parsed = CurrentFocusScoreRowSchema.parse(row);
  return {
    id: parsed.id,
    userId: parsed.user_id,
    currentScore: parsed.current_score,
    previousScore: parsed.previous_score,
    band: parsed.band,
    factors: parsed.factors,
    updatedAt: parsed.updated_at,
    createdAt: parsed.created_at,
    lastChangeReason: parsed.last_change_reason,
    topPositiveFactor: parsed.top_positive_factor,
    topNegativeFactor: parsed.top_negative_factor,
  };
}

function mapHistoryRowToPoint(row: unknown): FocusScoreHistoryPoint {
  const parsed = FocusScoreHistoryRowSchema.parse(row);
  return {
    timestamp: parsed.occurred_at,
    score: parsed.score,
    delta: parsed.delta,
    reason: parsed.reason,
  };
}

export async function fetchCurrentFocusScore(userId: string): Promise<FocusScoreRecord | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await withResilience(
      supabase
        .from('focus_score_current')
        .select('*')
        .eq('user_id', userId)
        .single(),
      { operation: 'fetchCurrentFocusScore' }
    );

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      debug.warn('Supabase fetchCurrentFocusScore failed, returning null fallback', error);
      return null;
    }

    return mapCurrentRowToRecord(data);
  } catch (err) {
    debug.error('Unexpected error in fetchCurrentFocusScore', err as Error);
    return null;
  }
}

export async function upsertCurrentFocusScore(
  userId: string,
  score: UpsertCurrentFocusScoreInput,
): Promise<FocusScoreRecord> {
  const input = UpsertCurrentFocusScoreInputSchema.parse(score);
  const supabase = getSupabaseClient();
  const { data, error } = await withResilience(
    supabase
      .from('focus_score_current')
      .upsert(
        {
          user_id: userId,
          current_score: input.currentScore,
          previous_score: input.previousScore,
          band: input.band,
          factors: input.factors,
          last_change_reason: input.lastChangeReason,
          top_positive_factor: input.topPositiveFactor,
          top_negative_factor: input.topNegativeFactor,
        },
        { onConflict: 'user_id' },
      )
      .select('*')
      .single(),
    { operation: 'upsertCurrentFocusScore' }
  );

  if (error) {
    if (error.code === '23505') {
      const existing = await fetchCurrentFocusScore(userId);
      if (existing) {
        return existing;
      }
    }
    throw new FocusIdentityRepositoryError('upsertCurrentFocusScore', error);
  }

  return mapCurrentRowToRecord(data);
}

export async function appendFocusScoreHistory(event: AppendFocusScoreHistoryEvent): Promise<FocusScoreHistoryPoint> {
  const validatedEvent = AppendFocusScoreHistoryEventSchema.parse(event);
  const supabase = getSupabaseClient();
  const { data, error } = await withResilience(
    supabase
      .from('focus_score_history')
      .insert({
        user_id: validatedEvent.userId,
        occurred_at: validatedEvent.timestamp,
        score: validatedEvent.score,
        delta: validatedEvent.delta,
        reason: validatedEvent.reason,
      })
      .select('user_id, occurred_at, score, delta, reason')
      .single(),
    { operation: 'appendFocusScoreHistory' }
  );

  if (error) {
    throw new FocusIdentityRepositoryError('appendFocusScoreHistory', error);
  }

  return mapHistoryRowToPoint(data);
}

export async function fetchFocusScoreHistory(userId: string, days: number): Promise<FocusScoreHistoryPoint[]> {
  try {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('focus_score_history')
      .select('user_id, occurred_at, score, delta, reason')
      .eq('user_id', userId)
      .gte('occurred_at', cutoff.toISOString())
      .order('occurred_at', { ascending: true });

    if (error) {
      debug.warn('Supabase fetchFocusScoreHistory failed, returning empty fallback', error);
      return [];
    }

    return (data ?? []).map(mapHistoryRowToPoint);
  } catch (err) {
    debug.error('Unexpected error in fetchFocusScoreHistory', err as Error);
    return [];
  }
}

export async function fetchMonthlyFocusReportInput(userId: string, month: string): Promise<MonthlyFocusReportInput> {
  const validatedMonth = MonthInputSchema.parse(month);
  const monthParts = validatedMonth.split('-');
  const yearPart = Number(monthParts[0]);
  const monthPart = Number(monthParts[1]);

  if (isNaN(yearPart) || isNaN(monthPart)) {
    throw new FocusIdentityRepositoryError('fetchMonthlyFocusReportInput:invalid-month', validatedMonth);
  }

  const monthStart = new Date(Date.UTC(yearPart, monthPart - 1, 1));
  const monthEnd = new Date(Date.UTC(yearPart, monthPart, 1));

  try {
    const supabase = getSupabaseClient();
    const { data: historyRows, error: historyError } = await supabase
      .from('focus_score_history')
      .select('user_id, occurred_at, score, delta, reason')
      .eq('user_id', userId)
      .gte('occurred_at', monthStart.toISOString())
      .lt('occurred_at', monthEnd.toISOString())
      .order('occurred_at', { ascending: true });

    if (historyError) {
      debug.warn('Supabase history fetch failed', historyError);
    }

    const monthHistory = (historyRows ?? []).map(mapHistoryRowToPoint);
    const { data, error } = await supabase
      .from('sessions')
      .select('duration, effective_duration, quality_score, status, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', monthStart.toISOString())
      .lt('completed_at', monthEnd.toISOString());

    if (error) {
      debug.warn('Supabase sessions fetch failed', error);
    }

    const rows = data ?? [];
    const totalFocusedMinutes = Math.floor(
      rows.reduce((sum, row) => sum + (typeof row.effective_duration === 'number' ? row.effective_duration : row.duration), 0) / 60,
    );
    const bestQuality = rows.reduce((best, row) => Math.max(best, row.quality_score ?? 0), 0);
    const bestGrade = bestQuality >= 95 ? 'S' : bestQuality >= 85 ? 'A' : bestQuality >= 70 ? 'B' : bestQuality >= 55 ? 'C' : 'D';

    return MonthlyFocusReportInputSchema.parse({
      userId,
      month: validatedMonth,
      historyPoints: monthHistory,
      sessionsCompleted: rows.length,
      totalFocusedMinutes,
      bestGrade,
    });
  } catch (err) {
    debug.error('Unexpected error in fetchMonthlyFocusReportInput', err as Error);
    return MonthlyFocusReportInputSchema.parse({
      userId,
      month: validatedMonth,
      historyPoints: [],
      sessionsCompleted: 0,
      totalFocusedMinutes: 0,
      bestGrade: 'D',
    });
  }
}
