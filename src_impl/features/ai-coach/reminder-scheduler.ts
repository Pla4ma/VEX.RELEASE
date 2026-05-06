/**
 * Reminder Scheduler
 * Business logic for scheduling reminders, managing comebacks, and difficulty
 *
 * Dependencies:
 * - Repository (data access)
 * - Persona Manager (coach state updates)
 * - Message Generator (message generation)
 * - Schemas (validation)
 */

import * as repository from "./repository";
import { ScheduleReminderInputSchema, ActivateComebackInputSchema, AdjustDifficultyInputSchema, type ReminderPlan, type ReminderType, type ComebackPlan, type ComebackStatus, type DifficultyProfile, type MessageCategory, type ScheduleReminderInput, type ActivateComebackInput, type AdjustDifficultyInput } from "./schemas";
import { getOrCreateCoachState, updateCoachState } from "./persona-manager";
import { generateMessage } from "./message-generator";

// ============================================================================
// Constants
// ============================================================================

const MUTE_DURATION_HOURS = 24;
const COMEBACK_BONUS_MULTIPLIER = 2.0;
const COMEBACK_TARGET_SESSIONS = 3;
const COMEBACK_EXPIRY_DAYS = 7;

// ============================================================================
// Reminder Planner
// ============================================================================

/**
 * Schedule a reminder
 */
export async function scheduleReminder(input: ScheduleReminderInput): Promise<ReminderPlan> {
  const validated = ScheduleReminderInputSchema.parse(input);

  // Generate message for the reminder
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

// ============================================================================
// Comeback Engine
// ============================================================================

/**
 * Activate comeback mode for a user
 */
export async function activateComeback(input: ActivateComebackInput): Promise<ComebackPlan> {
  const validated = ActivateComebackInputSchema.parse(input);

  // Check if there's an existing active comeback
  const existing = await repository.fetchActiveComebackPlan(validated.userId);
  if (existing) {
    // User declined previously, don't offer again
    if (existing.status === "DECLINED") {
      throw new Error("Comeback was previously declined");
    }
    // Already has active comeback
    if (existing.status === "ACTIVE") {
      return existing;
    }
  }

  const now = Date.now();
  const plan: ComebackPlan = {
    id: crypto.randomUUID(),
    userId: validated.userId,
    previousStreak: validated.previousStreak,
    daysInactive: validated.daysInactive,
    status: "OFFERED" as ComebackStatus,
    startedAt: now,
    expiresAt: now + COMEBACK_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    sessionsCompleted: 0,
    targetSessions: COMEBACK_TARGET_SESSIONS,
    bonusMultiplier: COMEBACK_BONUS_MULTIPLIER,
    messages: generateComebackMessages(),
  };

  const saved = await repository.upsertComebackPlan(plan);

  // Update coach state
  await updateCoachState(validated.userId, "COMEBACK_MODE", {
    previousStreak: validated.previousStreak,
    daysInactive: validated.daysInactive,
  });

  return saved;
}

function generateComebackMessages(): Array<{ id: string; day: number; content: string; sent: boolean; sentAt: number | null }> {
  const messages = [
    { day: 1, content: "Welcome back! 💪 Your comeback story starts today. First session gets {{bonusMultiplier}}x XP!" },
    { day: 2, content: "Day 2 of your comeback! 🔥 You're rebuilding stronger than before. Keep it up!" },
    { day: 3, content: "Comeback complete! 🎉 You've earned your full {{bonusMultiplier}}x bonus. Your streak is back on track!" },
  ];

  return messages.map((m) => ({
    id: crypto.randomUUID(),
    day: m.day,
    content: m.content,
    sent: false,
    sentAt: null,
  }));
}

/**
 * Accept a comeback offer
 */
export async function acceptComeback(userId: string, planId: string): Promise<ComebackPlan> {
  const plan = await repository.updateComebackPlanStatus(planId, "ACTIVE");

  // Send first message immediately
  const firstMessage = plan.messages[0];
  if (firstMessage) {
    // Would trigger message send via notification service
  }

  return plan;
}

/**
 * Track comeback session completion
 */
export async function trackComebackSession(userId: string, sessionCompleted: boolean): Promise<ComebackPlan | null> {
  const plan = await repository.fetchActiveComebackPlan(userId);
  if (!plan || plan.status !== "ACTIVE") {
    return null;
  }

  if (sessionCompleted) {
    const newCount = plan.sessionsCompleted + 1;

    if (newCount >= plan.targetSessions) {
      // Comeback complete
      await repository.updateComebackPlanStatus(plan.id, "COMPLETED", newCount);

      // Exit comeback mode
      await updateCoachState(userId, "HIGH_CONFIDENCE", { comebackCompleted: true });

      // Send completion message
      const completionMessage = await generateMessage({
        userId,
        category: "MILESTONE_HYPE",
        context: { milestoneDays: plan.targetSessions, comebackMultiplier: plan.bonusMultiplier },
        preferredDelivery: "BOTH",
      });

      if (completionMessage) {
        await repository.createCoachMessage(completionMessage);
      }
    } else {
      await repository.updateComebackPlanStatus(plan.id, "ACTIVE", newCount);

      // Send next day's message
      const nextMessage = plan.messages[newCount];
      if (nextMessage && !nextMessage.sent) {
        // Would schedule/send next message
      }
    }
  }

  return repository.fetchActiveComebackPlan(userId);
}

// ============================================================================
// Adaptive Difficulty
// ============================================================================

/**
 * Adjust difficulty for a user based on performance
 */
export async function adjustDifficulty(input: AdjustDifficultyInput): Promise<DifficultyProfile> {
  const validated = AdjustDifficultyInputSchema.parse(input);

  let profile = await repository.fetchDifficultyProfile(validated.userId);

  if (!profile) {
    // Create default profile
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

  // Calculate new recommendation
  let recommendedDifficulty = profile.currentDifficulty;

  if (validated.targetDifficulty !== undefined) {
    recommendedDifficulty = validated.targetDifficulty;
  } else {
    // Auto-adjust based on success rates
    if (profile.successRateRecent < 0.5) {
      recommendedDifficulty = Math.max(1, profile.currentDifficulty - 1);
    } else if (profile.successRateRecent > 0.9 && profile.currentDifficulty < 10) {
      recommendedDifficulty = profile.currentDifficulty + 1;
    }
  }

  const trend: "IMPROVING" | "STABLE" | "DECLINING" = recommendedDifficulty > profile.currentDifficulty ? "IMPROVING" : recommendedDifficulty < profile.currentDifficulty ? "DECLINING" : "STABLE";

  const updatedProfile: DifficultyProfile = {
    ...profile,
    recommendedDifficulty,
    lastAdjustmentAt: Date.now(),
    adjustmentReason: validated.reason,
    trend,
  };

  return repository.upsertDifficultyProfile(updatedProfile);
}

// Export constants for use in other modules
export { COMEBACK_BONUS_MULTIPLIER, COMEBACK_TARGET_SESSIONS, MUTE_DURATION_HOURS };
