import { task } from '@trigger.dev/sdk';
import * as Sentry from '@sentry/node';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ChallengeRefreshInputSchema, ChallengeRefreshOutputSchema } from '../../shared/jobs/schemas.ts';
import { JOB_IDS, SCHEDULE_CONFIGS } from '../../shared/jobs/job-constants.ts';
import type { ChallengeRefreshOutput } from '../../shared/jobs/schemas.ts';
import { scheduleChallengeExpiryNotifications } from '../../src/features/notifications/retention-strategy';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
});
const httpRequest = globalThis.fetch.bind(globalThis);

const ChallengePoolItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['MINUTES', 'SESSIONS', 'SOCIAL', 'STREAK', 'BOSS_DAMAGE', 'ACHIEVEMENT']),
  title: z.string().min(1),
  description: z.string().min(1),
  requiredCount: z.number().int().positive(),
  xpReward: z.number().int().nonnegative(),
  coinReward: z.number().int().nonnegative(),
  weight: z.number().positive(),
}).strict();

const CHALLENGE_POOL = [
  { id: 'easy-15-minute-session', category: 'MINUTES', title: 'Complete a 15-min session', description: 'Finish one focused 15 minute session today.', requiredCount: 15, xpReward: 100, coinReward: 50, weight: 0.4 / 3 },
  { id: 'easy-log-mood', category: 'SOCIAL', title: 'Log a mood', description: 'Check in with how you are feeling today.', requiredCount: 1, xpReward: 100, coinReward: 50, weight: 0.4 / 3 },
  { id: 'easy-check-streak', category: 'STREAK', title: 'Check streak', description: 'Open your streak and make sure today is on track.', requiredCount: 1, xpReward: 100, coinReward: 50, weight: 0.4 / 3 },
  { id: 'medium-25-minute-session', category: 'MINUTES', title: 'Complete a 25-min session', description: 'Finish at least 25 focused minutes today.', requiredCount: 25, xpReward: 250, coinReward: 100, weight: 0.4 / 3 },
  { id: 'medium-two-sessions', category: 'SESSIONS', title: 'Complete 2 sessions today', description: 'Finish two separate focus sessions today.', requiredCount: 2, xpReward: 250, coinReward: 100, weight: 0.4 / 3 },
  { id: 'medium-purity', category: 'BOSS_DAMAGE', title: 'Achieve 80%+ purity', description: 'Record a focus session with at least 80% purity.', requiredCount: 1, xpReward: 250, coinReward: 100, weight: 0.4 / 3 },
  { id: 'hard-45-minute-session', category: 'MINUTES', title: 'Complete a 45-min session', description: 'Lock in for a full 45 minute session today.', requiredCount: 45, xpReward: 500, coinReward: 250, weight: 0.2 / 3 },
  { id: 'hard-three-sessions', category: 'SESSIONS', title: '3 sessions in one day', description: 'Finish three focus sessions before the day resets.', requiredCount: 3, xpReward: 500, coinReward: 250, weight: 0.2 / 3 },
  { id: 'hard-seven-day-streak', category: 'ACHIEVEMENT', title: '7-day streak', description: 'Reach or maintain a 7 day streak.', requiredCount: 7, xpReward: 500, coinReward: 250, weight: 0.2 / 3 },
].map((item) => ChallengePoolItemSchema.parse(item));

const weightedSample = (count: number) => {
  const pool = [...CHALLENGE_POOL];
  const picked: typeof CHALLENGE_POOL = [];
  while (picked.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let cursor = Math.random() * totalWeight;
    const index = pool.findIndex((item) => {
      cursor -= item.weight;
      return cursor <= 0;
    });
    picked.push(pool.splice(index >= 0 ? index : 0, 1)[0]);
  }
  return picked;
};

const toMidnightUtc = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0));

const deterministicUuid = (seed: string) => {
  const hash = createHash('sha1').update(seed).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
};

const challengeIdFor = (seasonId: string, dateKey: string, userId: string, templateId: string) =>
  deterministicUuid(`${seasonId}:${dateKey}:${userId}:${templateId}`);

async function listRecentlyActiveUsers(userIds?: string[]): Promise<string[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeUsers: string[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users ?? [];
    for (const user of users) {
      if (!user.last_sign_in_at) continue;
      if (new Date(user.last_sign_in_at) < cutoff) continue;
      if (userIds && userIds.length > 0 && !userIds.includes(user.id)) continue;
      activeUsers.push(user.id);
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return activeUsers;
}

async function sendPushNotifications(userIds: string[]): Promise<number> {
  if (userIds.length === 0) return 0;
  const { data, error } = await supabase
    .from('push_tokens')
    .select('user_id, token')
    .in('user_id', userIds)
    .eq('is_active', true);
  if (error) throw error;
  let sent = 0;
  for (const row of data ?? []) {
    const token = (row as { token?: string }).token;
    if (!token) continue;
    const response = await httpRequest('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: 'Your daily challenges are live',
        body: "Keep your streak rolling. Today's daily challenges are ready when you are.",
        data: {
          type: 'daily_challenge_refresh',
        },
      }),
    });
    if (response.ok) sent += 1;
  }
  return sent;
}

export const challengeDailyRefresh = task({
  id: JOB_IDS.CHALLENGE_DAILY_REFRESH,
  trigger: {
    type: 'schedule',
    cron: SCHEDULE_CONFIGS.DAILY_CHALLENGE_REFRESH,
  },
  run: async (rawInput): Promise<ChallengeRefreshOutput> => {
    const startedAt = Date.now();
    const input = ChallengeRefreshInputSchema.parse({
      challengeTypes: ['DAILY'],
      preserveProgress: false,
      ...(rawInput ?? {}),
    });

    try {
      const { error: seasonError } = await supabase.from('seasons').select('id').eq('id', input.seasonId).single();
      if (seasonError) throw seasonError;

      const users = await listRecentlyActiveUsers(input.userIds);
      const now = new Date();
      const expiresAt = toMidnightUtc(now);
      const dateKey = now.toISOString().slice(0, 10);
      const errors: Array<{ userId: string; error: string }> = [];
      let challengesGenerated = 0;
      let challengesAssigned = 0;

      const { error: expireError } = await supabase
        .from('user_challenges')
        .update({ status: 'EXPIRED' })
        .eq('status', 'ACTIVE')
        .lt('expires_at', now.toISOString());
      if (expireError) throw expireError;

      for (const userId of users) {
        try {
          for (const item of weightedSample(3)) {
            const challengeId = challengeIdFor(input.seasonId, dateKey, userId, item.id);
            const { error: challengeError } = await supabase.from('challenges').upsert(
              {
                id: challengeId,
                season_id: input.seasonId,
                type: 'DAILY',
                category: item.category,
                title: item.title,
                description: item.description,
                target_value: item.requiredCount,
                target_type: item.category,
                reward_type: 'XP',
                reward_amount: item.xpReward,
                start_at: now.toISOString(),
                end_at: expiresAt.toISOString(),
                is_active: true,
                created_at: now.toISOString(),
              },
              { onConflict: 'id' }
            );
            if (challengeError) throw challengeError;
            challengesGenerated += 1;

            const { error: assignmentError } = await supabase.from('user_challenges').upsert(
              {
                user_id: userId,
                challenge_id: challengeId,
                current_value: 0,
                status: 'ACTIVE',
                assigned_at: now.toISOString(),
                completed_at: null,
                claimed_at: null,
                expires_at: expiresAt.toISOString(),
                reroll_count: 0,
                created_at: now.toISOString(),
              },
              { onConflict: 'user_id,challenge_id' }
            );
            if (assignmentError) throw assignmentError;
            challengesAssigned += 1;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push({ userId, error: message });
          Sentry.captureException(error, { tags: { job: JOB_IDS.CHALLENGE_DAILY_REFRESH, userId } });
        }
      }

      const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0);
      const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
      const { data: streakRows, error: streakError } = await supabase
        .from('streaks')
        .select('user_id, current_days, last_qualifying_session_at, current_day_completed_at')
        .gt('current_days', 0)
        .gte('last_qualifying_session_at', startOfYesterday)
        .lt('last_qualifying_session_at', startOfToday)
        .or(`current_day_completed_at.is.null,current_day_completed_at.lt.${startOfToday}`);
      if (streakError) throw streakError;

      await sendPushNotifications((streakRows ?? []).map((row) => (row as { user_id: string }).user_id));

      for (const userId of users) {
        try {
          await scheduleChallengeExpiryNotifications(userId);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push({ userId, error: `Challenge expiry scheduling failed: ${message}` });
          Sentry.captureException(err, { tags: { job: JOB_IDS.CHALLENGE_DAILY_REFRESH, userId } });
        }
      }

      return ChallengeRefreshOutputSchema.parse({
        challengesGenerated,
        challengesAssigned,
        errors,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      Sentry.captureException(error, { tags: { job: JOB_IDS.CHALLENGE_DAILY_REFRESH } });
      throw error;
    }
  },
});

export default challengeDailyRefresh;
