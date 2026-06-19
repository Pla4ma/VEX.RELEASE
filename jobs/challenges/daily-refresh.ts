import { task } from '@trigger.dev/sdk';
import { Sentry, initJobSentry } from '../shared/sentry';
import { createClient } from '@supabase/supabase-js';
import { ChallengeRefreshInputSchema, ChallengeRefreshOutputSchema } from '../../shared/jobs/schemas.ts';
import { JOB_IDS, SCHEDULE_CONFIGS } from '../../shared/jobs/job-constants.ts';
import type { ChallengeRefreshOutput } from '../../shared/jobs/schemas.ts';
import { scheduleChallengeExpiryNotifications } from './expiry-reminders.ts';
import {
  weightedSample,
  toMidnightUtc,
  challengeIdFor,
  listRecentlyActiveUsers,
  sendPushNotifications,
} from './daily-refresh-query.ts';

  initJobSentry();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

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

      const users = await listRecentlyActiveUsers(supabase, input.userIds);
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

      const userPromises = users.map(async (userId) => {
        try {
          const items = weightedSample(3);
          const challengePromises = items.map(async (item) => {
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

            return { challengeId, userId };
          });

          const results = await Promise.all(challengePromises);
          return { userId, results, errors: [] as Array<{ userId: string; error: string }> };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { userId, results: [], errors: [{ userId, error: message }] };
        }
      });

      const userResults = await Promise.all(userPromises);

      for (const { results, errors: userErrors } of userResults) {
        challengesGenerated += results.length;
        challengesAssigned += results.length;
        errors.push(...userErrors);
        for (const { userId, error } of userErrors) {
          Sentry.captureException(new Error(error), { tags: { job: JOB_IDS.CHALLENGE_DAILY_REFRESH, userId } });
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

      await sendPushNotifications(supabase, (streakRows ?? []).map((row) => (row as { user_id: string }).user_id));

      const expiryPromises = users.map(async (userId) => {
        try {
          await scheduleChallengeExpiryNotifications(supabase, userId);
          return { userId, error: null as string | null };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { userId, error: `Challenge expiry scheduling failed: ${message}` };
        }
      });

      const expiryResults = await Promise.all(expiryPromises);
      for (const { userId, error } of expiryResults) {
        if (error) {
          errors.push({ userId, error });
          Sentry.captureException(new Error(error), { tags: { job: JOB_IDS.CHALLENGE_DAILY_REFRESH, userId } });
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
