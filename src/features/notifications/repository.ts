import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import {
  ChallengeExpiryCandidateSchema,
  ReminderPlanInputSchema,
  ReminderPlanRowSchema,
  RetentionUserProfileSchema,
  type ChallengeExpiryCandidate,
  type ReminderPlanInput,
  type ReminderPlanRow,
  type RetentionReminderType,
  type RetentionUserProfile,
} from './schemas';

const UnreadNotificationsCountSchema = z.number().int().nonnegative();

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(
      `Repository error in ${operation}: ${
        originalError instanceof Error ? originalError.message : 'Unknown error'
      }`
    );
    this.name = 'RepositoryError';
  }
}

const supabase = getSupabaseClient();

export async function fetchUnreadNotificationsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    throw new RepositoryError('fetchUnreadNotificationsCount', error);
  }

  return UnreadNotificationsCountSchema.parse(count ?? 0);
}

export async function fetchRetentionUserProfile(userId: string): Promise<RetentionUserProfile> {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new RepositoryError('fetchRetentionUserProfile', error);
  }

  return RetentionUserProfileSchema.parse({
    id: userId,
    firstName: typeof data?.first_name === 'string' ? data.first_name : null,
  });
}

export async function upsertReminderPlan(input: ReminderPlanInput): Promise<ReminderPlanRow> {
  const reminder = ReminderPlanInputSchema.parse(input);
  const now = Date.now();
  const { data, error } = await supabase
    .from('reminder_plans')
    .upsert({
      id: crypto.randomUUID(),
      user_id: reminder.userId,
      reminder_type: reminder.type,
      scheduled_for: reminder.scheduledFor,
      delivery_method: 'BOTH',
      status: 'SCHEDULED',
      context: { message: reminder.message, metadata: reminder.metadata },
      created_at: now,
      updated_at: now,
    }, { onConflict: 'user_id,reminder_type' })
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('upsertReminderPlan', error);
  }

  return ReminderPlanRowSchema.parse(data);
}

export async function hasScheduledReminderWithin(userId: string, before: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('reminder_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'SCHEDULED')
    .gte('scheduled_for', Date.now())
    .lte('scheduled_for', before)
    .limit(1);

  if (error) {
    throw new RepositoryError('hasScheduledReminderWithin', error);
  }

  return (data ?? []).length > 0;
}

export async function fetchChallengeExpiryCandidates(
  userId: string,
): Promise<ChallengeExpiryCandidate[]> {
  const now = new Date();
  const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from('user_challenges')
    .select('user_id, challenge_id, current_value, expires_at, challenges(title, target_value)')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .gt('current_value', 0)
    .gt('expires_at', now.toISOString())
    .lt('expires_at', nextDay.toISOString());

  if (error) {
    throw new RepositoryError('fetchChallengeExpiryCandidates', error);
  }

  return (data ?? []).map((row) => {
    const record = row as Record<string, unknown>;
    const challenge = record.challenges;
    const challengeRecord = typeof challenge === 'object' && challenge !== null
      ? challenge as Record<string, unknown>
      : {};
    return ChallengeExpiryCandidateSchema.parse({
      userId: record.user_id,
      challengeId: record.challenge_id,
      title: challengeRecord.title,
      currentValue: record.current_value,
      targetValue: challengeRecord.target_value,
      expiresAt: Date.parse(String(record.expires_at)),
    });
  });
}

export async function fetchReEngagementCandidates(cutoff: number): Promise<Array<{
  userId: string;
  lastSessionAt: number;
  previousStreak: number;
}>> {
  const { data, error } = await supabase
    .from('streaks')
    .select('user_id, current_days, longest_days, last_qualifying_session_at')
    .not('last_qualifying_session_at', 'is', null)
    .lt('last_qualifying_session_at', cutoff)
    .gt('longest_days', 0);

  if (error) {
    throw new RepositoryError('fetchReEngagementCandidates', error);
  }

  return (data ?? []).map((row) => {
    const record = row as Record<string, unknown>;
    const lastSessionAt = Number(record.last_qualifying_session_at);
    const currentDays = Number(record.current_days ?? 0);
    const longestDays = Number(record.longest_days ?? 0);
    return {
      userId: String(record.user_id),
      lastSessionAt,
      previousStreak: Math.max(currentDays, longestDays),
    };
  }).filter((row) => row.userId.length > 0 && Number.isFinite(row.lastSessionAt));
}

export { type RetentionReminderType };
