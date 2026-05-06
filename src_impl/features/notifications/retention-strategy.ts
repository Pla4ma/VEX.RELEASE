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
    throw error;
  }
}

export async function scheduleOnboardingNotifications(userId: string): Promise<void> {
  const validatedUserId = UserIdSchema.parse(userId);
  const timezone = getUserTimezone(validatedUserId);
  const profile = await fetchRetentionUserProfile(validatedUserId);
  const firstName = profile.firstName?.trim() || 'Someone';
  const reminders: ReminderDraft[] = [
    {
      type: 'RETENTION_ONBOARDING_DAY_1',
      scheduledFor: daysLaterAt(1, 9, timezone),
      message: 'Your streak starts now. One session today keeps it alive.',
      metadata: { day: 1, timezone },
    },
    {
      type: 'RETENTION_ONBOARDING_DAY_3',
      scheduledFor: daysLaterAt(3, 19, timezone),
      message: '3 days since you started. Quick check-in?',
      metadata: { day: 3, timezone },
    },
    {
      type: 'RETENTION_ONBOARDING_DAY_7',
      scheduledFor: daysLaterAt(7, 9, timezone),
      message: `One week in. ${firstName} is on the leaderboard.`,
      metadata: { day: 7, timezone, firstName },
    },
  ];

  await Promise.all(reminders.map((reminder) => scheduleReminder(validatedUserId, reminder)));
}

export async function scheduleStreakProtectionNotification(
  userId: string,
  streak: number,
  lastSessionAt: number,
): Promise<void> {
  const input = StreakInputSchema.parse({ userId, streak, lastSessionAt });
  if (input.streak < 1) {
    return;
  }

  if (await hasScheduledReminderWithin(input.userId, Date.now() + DAY_MS)) {
    return;
  }

  const timezone = getUserTimezone(input.userId);
  const message = input.streak >= 7
    ? `🔥 ${input.streak}-day streak. Protect it today.`
    : 'Day 1 streak — do it again tomorrow.';
  await scheduleReminder(input.userId, {
    type: 'RETENTION_STREAK_PROTECTION',
    scheduledFor: respectQuietHours(input.lastSessionAt + 20 * HOUR_MS, timezone),
    message,
    metadata: { streak: input.streak, lastSessionAt: input.lastSessionAt, timezone },
  });
}

export async function scheduleReEngagementNotification(
  userId: string,
  daysSinceLastSession: number,
  previousStreak: number,
): Promise<void> {
  const input = ReEngagementInputSchema.parse({ userId, daysSinceLastSession, previousStreak });
  const messages: Record<number, string> = {
    1: "Yesterday's session was good. One more today keeps the chain.",
    2: '2 days away. Comebacks earn 1.5x XP for the next 3 sessions.',
    3: `Still here. Your ${input.previousStreak}-day streak can restart anytime.`,
  };
  const message = messages[input.daysSinceLastSession];
  if (!message) {
    return;
  }

  const timezone = getUserTimezone(input.userId);
  await scheduleReminder(input.userId, {
    type: 'RETENTION_RE_ENGAGEMENT',
    scheduledFor: respectQuietHours(Date.now() + HOUR_MS, timezone),
    message,
    metadata: { daysSinceLastSession: input.daysSinceLastSession, previousStreak: input.previousStreak, timezone },
  });
}

export async function scheduleChallengeExpiryNotifications(userId: string): Promise<void> {
  const validatedUserId = UserIdSchema.parse(userId);
  const timezone = getUserTimezone(validatedUserId);
  const candidates = await fetchChallengeExpiryCandidates(validatedUserId);
  await Promise.all(candidates.map((challenge) => scheduleReminder(validatedUserId, {
    type: 'RETENTION_CHALLENGE_EXPIRY',
    scheduledFor: respectQuietHours(Math.max(Date.now() + HOUR_MS, challenge.expiresAt - 3 * HOUR_MS), timezone),
    message: `${challenge.title} expires soon. Finish it before it resets.`,
    metadata: { challengeId: challenge.challengeId, progress: challenge.currentValue / challenge.targetValue, expiresAt: challenge.expiresAt, timezone },
  })));
}
