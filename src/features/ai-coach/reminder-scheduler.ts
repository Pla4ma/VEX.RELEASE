import * as repository from "./repository";
import {
  ScheduleReminderInputSchema,
  AdjustDifficultyInputSchema,
  type ReminderPlan,
  type ReminderType,
  type DifficultyProfile,
  type MessageCategory,
  type ScheduleReminderInput,
  type AdjustDifficultyInput,
} from "./schemas";
import { generateMessage } from "./message-generator";
import {
  activateComeback,
  acceptComeback,
  trackComebackSession,
  COMEBACK_BONUS_MULTIPLIER,
  COMEBACK_TARGET_SESSIONS,
} from "./comeback-manager";

const MUTE_DURATION_HOURS = 24;

export async function scheduleReminder(
  input: ScheduleReminderInput,
): Promise<ReminderPlan> {
  const validated = ScheduleReminderInputSchema.parse(input);
  const category = reminderTypeToCategory(validated.reminderType);
  const message = await generateMessage({
    userId: validated.userId,
    category,
    context: {},
    preferredDelivery: "PUSH",
  });
  if (!message) {
    throw new Error("Failed to generate reminder message");
  }
  const savedMessage = await repository.createCoachMessage(message);
  const reminder: ReminderPlan = {
    id: crypto.randomUUID(),
    userId: validated.userId,
    reminderType: validated.reminderType,
    scheduledFor: validated.scheduledFor,
    messageId: savedMessage.id,
    priority: validated.priority || 5,
    sent: false,
    sentAt: null,
    delivered: false,
    opened: false,
  };
  return repository.createReminderPlan(reminder);
}

function reminderTypeToCategory(reminderType: ReminderType): MessageCategory {
  const mapping: Record<ReminderType, MessageCategory> = {
    STREAK_WARNING: "STREAK_RISK",
    STREAK_CHECK: "STREAK_RISK",
    OPTIMAL_SESSION_TIME: "SESSION_SUGGESTION",
    CHALLENGE_DEADLINE: "CHALLENGE_PROMPT",
    BOSS_TIMEOUT: "CHALLENGE_PROMPT",
    COMEBACK_OPPORTUNITY: "COMEBACK_SUPPORT",
    MILESTONE_APPROACHING: "MILESTONE_HYPE",
    PERSONALIZED_MOTIVATION: "MOTIVATION_BOOST",
    BREAK_REMINDER: "BREAK_SUGGESTION",
  };
  return mapping[reminderType];
}

export async function adjustDifficulty(
  input: AdjustDifficultyInput,
): Promise<DifficultyProfile> {
  const validated = AdjustDifficultyInputSchema.parse(input);
  let profile = await repository.fetchDifficultyProfile(validated.userId);
  if (!profile) {
    profile = {
      userId: validated.userId,
      currentDifficulty: 5,
      recommendedDifficulty: 5,
      lastAdjustmentAt: Date.now(),
      adjustmentReason: null,
      successRateRecent: 0.8,
      successRateOverall: 0.8,
      trend: "STABLE",
    };
  }
  let recommendedDifficulty = profile.currentDifficulty;
  if (validated.targetDifficulty !== undefined) {
    recommendedDifficulty = validated.targetDifficulty;
  } else {
    if (profile.successRateRecent < 0.5) {
      recommendedDifficulty = Math.max(1, profile.currentDifficulty - 1);
    } else if (
      profile.successRateRecent > 0.9 &&
      profile.currentDifficulty < 10
    ) {
      recommendedDifficulty = profile.currentDifficulty + 1;
    }
  }
  const trend: "IMPROVING" | "STABLE" | "DECLINING" =
    recommendedDifficulty > profile.currentDifficulty
      ? "IMPROVING"
      : recommendedDifficulty < profile.currentDifficulty
        ? "DECLINING"
        : "STABLE";
  const updatedProfile: DifficultyProfile = {
    ...profile,
    recommendedDifficulty,
    lastAdjustmentAt: Date.now(),
    adjustmentReason: validated.reason,
    trend,
  };
  return repository.upsertDifficultyProfile(updatedProfile);
}

export {
  activateComeback,
  acceptComeback,
  trackComebackSession,
  COMEBACK_BONUS_MULTIPLIER,
  COMEBACK_TARGET_SESSIONS,
  MUTE_DURATION_HOURS,
};
