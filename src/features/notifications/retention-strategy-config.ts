import { z } from 'zod';

import { scheduleForLocalTime } from '../ai-coach/utils/timezone';
import type { RetentionReminderType } from './repository';
import { ReminderPlanInputSchema } from './schemas';

export const UserIdSchema = z.string().uuid();
export const StreakInputSchema = z
  .object({
    userId: UserIdSchema,
    streak: z.number().int().nonnegative(),
    lastSessionAt: z.number().int().positive(),
  })
  .strict();
export const ReEngagementInputSchema = z
  .object({
    userId: UserIdSchema,
    daysSinceLastSession: z.number().int().positive(),
    previousStreak: z.number().int().nonnegative(),
  })
  .strict();

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export type ReminderDraft = {
  type: RetentionReminderType;
  scheduledFor: number;
  message: string;
  metadata: Record<string, unknown>;
};

export function zonedParts(
  timestamp: number,
  timezone: string,
): {
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

export function localTimestamp(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
): number {
  return scheduleForLocalTime(
    hour,
    0,
    timezone,
    new Date(Date.UTC(year, month - 1, day)),
  );
}

export function respectQuietHours(timestamp: number, timezone: string): number {
  const local = zonedParts(timestamp, timezone);
  if (local.hour >= 22) {
    return localTimestamp(timezone, local.year, local.month, local.day + 1, 8);
  }
  if (local.hour < 8) {
    return localTimestamp(timezone, local.year, local.month, local.day, 8);
  }
  return timestamp;
}

export function daysLaterAt(
  days: number,
  hour: number,
  timezone: string,
): number {
  return respectQuietHours(
    scheduleForLocalTime(
      hour,
      0,
      timezone,
      new Date(Date.now() + days * DAY_MS),
    ),
    timezone,
  );
}
