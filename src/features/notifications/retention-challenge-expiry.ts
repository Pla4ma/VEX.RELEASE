import * as Sentry from '@sentry/react-native';

import { getUserTimezone } from '../ai-coach/utils/timezone';
import {
  fetchChallengeExpiryCandidates,
  upsertReminderPlan,
} from './repository';
import { ReminderPlanInputSchema } from './schemas';
import {
  UserIdSchema,
  HOUR_MS,
  respectQuietHours,
  type ReminderDraft,
} from './retention-strategy-config';

async function scheduleReminder(
  userId: string,
  draft: ReminderDraft,
): Promise<void> {
  try {
    await upsertReminderPlan(
      ReminderPlanInputSchema.parse({ userId, ...draft }),
    );
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'notifications.retention',
      message: 'Retention reminder scheduling failed',
      level: 'error',
      data: { userId, type: draft.type, scheduledFor: draft.scheduledFor },
    });
    Sentry.captureException(error, {
      tags: { feature: 'retention-notifications', reminderType: draft.type },
      extra: { userId },
    });
  }
}

export async function scheduleChallengeExpiryNotifications(
  userId: string,
): Promise<void> {
  const validatedUserId = UserIdSchema.parse(userId);
  const timezone = getUserTimezone(validatedUserId);
  const candidates = await fetchChallengeExpiryCandidates(validatedUserId);
  await Promise.all(
    candidates.map((challenge) =>
      scheduleReminder(validatedUserId, {
        type: 'RETENTION_CHALLENGE_EXPIRY',
        scheduledFor: respectQuietHours(
          Math.max(Date.now() + HOUR_MS, challenge.expiresAt - 3 * HOUR_MS),
          timezone,
        ),
        message: `${challenge.title} expires soon. Finish it before it resets.`,
        metadata: {
          challengeId: challenge.challengeId,
          progress: challenge.currentValue / challenge.targetValue,
          expiresAt: challenge.expiresAt,
          timezone,
        },
      }),
    ),
  );
}
