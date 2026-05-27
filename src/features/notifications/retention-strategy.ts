import * as Sentry from "@sentry/react-native";

import { getUserTimezone } from "../ai-coach/utils/timezone";
import { decideNudge } from "../notification-policy/service";
import {
  fetchChallengeExpiryCandidates,
  fetchRetentionUserProfile,
  hasScheduledReminderWithin,
  upsertReminderPlan,
} from "./repository";
import { ReminderPlanInputSchema } from "./schemas";
import {
  UserIdSchema,
  StreakInputSchema,
  ReEngagementInputSchema,
  HOUR_MS,
  DAY_MS,
  respectQuietHours,
  daysLaterAt,
  type ReminderDraft,
} from "./retention-strategy-config";

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
      category: "notifications.retention",
      message: "Retention reminder scheduling failed",
      level: "error",
      data: { userId, type: draft.type, scheduledFor: draft.scheduledFor },
    });
    Sentry.captureException(error, {
      tags: { feature: "retention-notifications", reminderType: draft.type },
      extra: { userId },
    });
  }
}

function streakProtectionAllowed(
  lane: "minimal_normal" | "game_like" | "deep_creative" | "student",
): boolean {
  const decision = decideNudge({
    lane,
    completedSessions: 1,
    daysSinceOnboarding: 1,
    context: "none",
    now: Date.now(),
    sentToday: 0,
    recentDismissals: 0,
    quietHoursActive: false,
    userMuted: false,
    manuallyScheduled: false,
    pausedCategories: [],
  });
  return decision.allowed;
}

export async function scheduleOnboardingNotifications(
  userId: string,
): Promise<void> {
  try {
    const validatedUserId = UserIdSchema.parse(userId);
    const timezone = getUserTimezone(validatedUserId);
    const profile = await fetchRetentionUserProfile(validatedUserId);
    const firstName = profile.firstName?.trim() || "Someone";
    const reminders: ReminderDraft[] = [
      {
        type: "RETENTION_ONBOARDING_DAY_1",
        scheduledFor: daysLaterAt(1, 9, timezone),
        message: "Your streak starts now. One session today keeps it alive.",
        metadata: { day: 1, timezone },
      },
      {
        type: "RETENTION_ONBOARDING_DAY_3",
        scheduledFor: daysLaterAt(3, 19, timezone),
        message: "3 days since you started. Quick check-in?",
        metadata: { day: 3, timezone },
      },
      {
        type: "RETENTION_ONBOARDING_DAY_7",
        scheduledFor: daysLaterAt(7, 9, timezone),
        message: `One week in. ${firstName} is on the leaderboard.`,
        metadata: { day: 7, timezone, firstName },
      },
    ];

    await Promise.all(
      reminders.map((reminder) => scheduleReminder(validatedUserId, reminder)),
    );
  } catch (error) {
    Sentry.addBreadcrumb({
      category: "notifications.retention",
      message: "Onboarding notifications scheduling failed",
      level: "error",
      data: { userId },
    });
    Sentry.captureException(error, {
      tags: {
        feature: "retention-notifications",
        operation: "schedule-onboarding",
      },
      extra: { userId },
    });
  }
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
  const message =
    input.streak >= 7
      ? `🔥 ${input.streak}-day streak. Protect it today.`
      : "Day 1 streak — do it again tomorrow.";
  await scheduleReminder(input.userId, {
    type: "RETENTION_STREAK_PROTECTION",
    scheduledFor: respectQuietHours(
      input.lastSessionAt + 20 * HOUR_MS,
      timezone,
    ),
    message,
    metadata: {
      streak: input.streak,
      lastSessionAt: input.lastSessionAt,
      timezone,
    },
  });
}

export async function scheduleReEngagementNotification(
  userId: string,
  daysSinceLastSession: number,
  previousStreak: number,
): Promise<void> {
  const input = ReEngagementInputSchema.parse({
    userId,
    daysSinceLastSession,
    previousStreak,
  });
  const messages: Record<number, string> = {
    1: "Yesterday's session was good. One more today keeps the chain.",
    2: "2 days away. Comebacks earn 1.5x XP for the next 3 sessions.",
    3: `Still here. Your ${input.previousStreak}-day streak can restart anytime.`,
  };
  const message = messages[input.daysSinceLastSession];
  if (!message) {
    return;
  }

  const timezone = getUserTimezone(input.userId);
  await scheduleReminder(input.userId, {
    type: "RETENTION_RE_ENGAGEMENT",
    scheduledFor: respectQuietHours(Date.now() + HOUR_MS, timezone),
    message,
    metadata: {
      daysSinceLastSession: input.daysSinceLastSession,
      previousStreak: input.previousStreak,
      timezone,
    },
  });
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
        type: "RETENTION_CHALLENGE_EXPIRY",
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
