import { StreakRowSchema, StreakSchema, type Streak } from './schemas';

export class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(
      `Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`,
    );
    this.name = 'RepositoryError';
  }
}

/** Re-export singleton from canonical source to avoid stale module-level references */
export { supabase } from '../../config/supabase';

export function parseStreakRow(row: unknown): Streak {
  const parsed = StreakRowSchema.parse(row);
  return StreakSchema.parse({
    id: parsed.id,
    userId: parsed.user_id,
    currentDays: parsed.current_days,
    longestDays: parsed.longest_days,
    lastQualifyingSessionAt: parsed.last_qualifying_session_at,
    currentDayCompletedAt: parsed.current_day_completed_at,
    frozenUntil: parsed.frozen_until,
    shieldsAvailable: parsed.shields_available,
    gracePeriodUsed: parsed.grace_period_used,
    timezone: parsed.timezone,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
  });
}
