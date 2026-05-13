import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

import { getUserTimezone, scheduleForLocalTime } from '../ai-coach/utils/timezone';
import {
  fetchChallengeExpiryCandidates,
  fetchRetentionUserProfile,
  hasScheduledReminderWithin,
  upsertReminderPlan,
  type RetentionReminderType,
} from './repository';
import { ReminderPlanInputSchema } from './schemas';

const UserIdSchema = z.string().uuid();
const StreakInputSchema = z.object({
  userId: UserIdSchema,
  streak: z.number().int().nonnegative(),
  lastSessionAt: z.number().int().positive(),
}).strict();
const ReEngagementInputSchema = z.object({
  userId: UserIdSchema,
  daysSinceLastSession: z.number().int().positive(),
  previousStreak: z.number().int().nonnegative(),
}).strict();

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type ReminderDraft = { type: RetentionReminderType; scheduledFor: number; message: string; metadata: Record<string, unknown> };

function zonedParts(timestamp: number, timezone: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date(timestamp));
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.get('year')),
    month: Number(values.get('month')),
    day: Number(values.get('day')),
    hour: Number(values.get('hour')),
  };
}

function localTimestamp(timezone: string, year: number, month: number, day: number, hour: number): number {
  return scheduleForLocalTime(hour, 0, timezone, new Date(Date.UTC(year, month - 1, day)));
}

function respectQuietHours(timestamp: number, timezone: string): number {
  const local = zonedParts(timestamp, timezone);
  if (local.hour >= 22) {
    return localTimestamp(timezone, local.year, local.month, local.day + 1, 8);
  }
  if (local.hour < 8) {
    return localTimestamp(timezone, local.year, local.month, local.day, 8);
  }
  return timestamp;
}

function daysLaterAt(days: number, hour: number, timezone: string): number {
  return respectQuietHours(
    scheduleForLocalTime(hour, 0, timezone, new Date(Date.now() + days * DAY_MS)),
    timezone,
  );
}

async function scheduleReminder(userId: string, draft: ReminderDraft): Promise<void> {
  try {
    await upsertReminderPlan(ReminderPlanInputSchema.parse({ userId, ...draft }));
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

export * from "./retention-strategy.part1";
