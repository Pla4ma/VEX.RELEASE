/**
 * Re-engagement Check Job
 *
 * Trigger.dev cron job that runs daily at 6am UTC.
 * Queries users whose last qualifying session was >24 hours ago and
 * proactively schedules re-engagement notifications to drive D7/D30 retention.
 */

import { task } from '@trigger.dev/sdk';
import { Sentry, initJobSentry } from '../shared/sentry';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { ReEngagementCheckOutputSchema } from '../../shared/jobs/schemas';
import { JOB_IDS, SCHEDULE_CONFIGS } from '../../shared/jobs/job-constants';
import { scheduleReEngagementNotification } from '../../src/features/notifications/retention-strategy';

  initJobSentry();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);

const DAY_MS = 24 * 60 * 60 * 1000;

const StreakRowSchema = z.object({
  user_id: z.string().uuid(),
  current_days: z.number().int().nullable().optional(),
  longest_days: z.number().int().nullable().optional(),
  last_qualifying_session_at: z.number().nullable().optional(),
});

export const reEngagementCheck = task({
  id: JOB_IDS.RE_ENGAGEMENT_CHECK,

  trigger: {
    type: 'schedule',
    cron: SCHEDULE_CONFIGS.DAILY_RE_ENGAGEMENT_CHECK,
  },

  run: async (_payload, io) => {
    const startedAt = Date.now();
    const cutoff = Date.now() - DAY_MS;

    const { data, error } = await io.runTask('fetch-reengagement-candidates', async () => {
      return supabase
        .from('streaks')
        .select('user_id, current_days, longest_days, last_qualifying_session_at')
        .not('last_qualifying_session_at', 'is', null)
        .lt('last_qualifying_session_at', cutoff)
        .gt('longest_days', 0);
    });

    if (error) {
      throw new Error(`Failed to fetch re-engagement candidates: ${error.message}`);
    }

    let scheduled = 0;
    let skipped = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    const rows = (data ?? []).map((row) => StreakRowSchema.safeParse(row));

    for (const parsed of rows) {
      if (!parsed.success) {
        errors.push({ userId: 'unknown', error: parsed.error.message });
        continue;
      }

      const row = parsed.data;
      const userId = row.user_id;
      const lastSessionAt = Number(row.last_qualifying_session_at ?? 0);
      const currentDays = Number(row.current_days ?? 0);
      const longestDays = Number(row.longest_days ?? 0);
      const previousStreak = Math.max(currentDays, longestDays);
      const daysSince = Math.floor((Date.now() - lastSessionAt) / DAY_MS);

      if (daysSince <= 0 || daysSince > 3) {
        skipped++;
        continue;
      }

      try {
        await io.runTask(`schedule-reengagement-${userId}`, async () => {
          return scheduleReEngagementNotification(userId, daysSince, previousStreak);
        });
        scheduled++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push({ userId, error: message });
        Sentry.captureException(err, {
          tags: { job: JOB_IDS.RE_ENGAGEMENT_CHECK, userId },
        });
      }
    }

    return ReEngagementCheckOutputSchema.parse({
      candidates: rows.length,
      scheduled,
      skipped,
      errors,
      durationMs: Date.now() - startedAt,
    });
  },
});

export default reEngagementCheck;
