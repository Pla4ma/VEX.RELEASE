import type { FocusScoreHistoryPoint, FocusScoreRecord } from './types';
import {
  CurrentFocusScoreRowSchema,
  FocusScoreHistoryRowSchema,
} from './repository-focus-score.schemas';

export class FocusIdentityRepositoryError extends Error {
  constructor(
    public operation: string,
    public cause: unknown,
  ) {
    super(
      `Focus identity repository failed during ${operation}: ${cause instanceof Error ? cause.message : String(cause)}`,
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

export function mapHistoryRowToPoint(row: unknown): FocusScoreHistoryPoint {
  const parsed = FocusScoreHistoryRowSchema.parse(row);
  return {
    timestamp: parsed.occurred_at,
    score: parsed.score,
    delta: parsed.delta,
    reason: parsed.reason,
  };
}
