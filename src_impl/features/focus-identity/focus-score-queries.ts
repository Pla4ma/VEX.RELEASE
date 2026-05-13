import { getSupabaseClient } from '../../config/supabase';
import type { FocusScoreRecord } from './types';
import {
  CurrentFocusScoreRowSchema,
  type UpsertCurrentFocusScoreInput,
  UpsertCurrentFocusScoreInputSchema,
} from './repository-focus-score.schemas';
import { withResilience } from '../../utils/supabase-resilience';

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

export function mapCurrentRowToRecord(row: unknown): FocusScoreRecord {
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

export async function fetchCurrentFocusScore(userId: string): Promise<FocusScoreRecord | null> {
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
    throw new FocusIdentityRepositoryError('fetchCurrentFocusScore', error);
  }

  return mapCurrentRowToRecord(data);
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
