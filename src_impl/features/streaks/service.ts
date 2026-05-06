/**
 * Streaks Service
 * Business logic for streak management
 *
 * Dependencies:
 * - Sessions (qualifying sessions increment streaks)
 * - Rewards (streak milestone rewards)
 * - Progression (streak XP bonuses)
 */

import { v4 } from "../../utils/uuid";
import * as repository from "./repository";
import { hasUsedStreakRestoreThisMonth } from "./restore-quest";
import { RecordSessionInputSchema, UseShieldInputSchema, FreezeStreakInputSchema, RestoreStreakInputSchema, ComebackStateSchema, type Streak, type StreakSummary, type StreakMilestone, type StreakEngineResult, type RecordSessionInput, type UseShieldInput, type RestoreStreakInput, type ComebackState, type RiskLevel } from "./schemas";

// ============================================================================
// Constants
// ============================================================================

const QUALIFYING_SESSION_MIN_DURATION = 10 * 60; // 10 minutes in seconds - lowered for better D1 retention
const QUALIFYING_SESSION_MIN_QUALITY = 50; // 0-100
const STREAK_WINDOW_HOURS = 24; // Hours to maintain streak - CRITICAL: 24h creates daily urgency, 48h kills retention
const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100, 180, 365];

const MILESTONE_REWARDS: Record<number, Partial<StreakMilestone>> = {
  3: { rewardType: "COINS", rewardAmount: 100, badgeId: "streak-3" },
  7: { rewardType: "COINS", rewardAmount: 250, badgeId: "streak-7" },
  14: { rewardType: "GEMS", rewardAmount: 25, badgeId: "streak-14" },
  30: { rewardType: "STREAK_SHIELD", rewardAmount: 1, badgeId: "streak-30" },
  60: { rewardType: "GEMS", rewardAmount: 100, badgeId: "streak-60" },
  100: { rewardType: "GEMS", rewardAmount: 250, badgeId: "streak-100" },
  180: { rewardType: "GEMS", rewardAmount: 500, badgeId: "streak-180" },
  365: { rewardType: "GEMS", rewardAmount: 1000, badgeId: "streak-365" },
};

// ============================================================================
// Streak State Management
// ============================================================================

export async function getOrCreateStreak(userId: string): Promise<Streak> {
  let streak = await repository.fetchStreak(userId);

  if (!streak) {
    streak = await repository.createStreak(userId);
  }

  return streak;
}

export async function getStreakSummary(userId: string): Promise<StreakSummary | null> {
  const streak = await repository.fetchStreak(userId);
  if (!streak) {
    return null;
  }

  const riskLevel = calculateRiskLevel(streak);
  const nextDeadline = calculateNextDeadline(streak);

  return {
    id: streak.id,
    userId: streak.userId,
    currentDays: streak.currentDays,
    longestDays: streak.longestDays,
    isAtRisk: riskLevel !== "NONE",
    riskLevel,
    nextDeadline,
    frozenUntil: streak.frozenUntil,
    shieldAvailable: streak.shieldsAvailable > 0,
  };
}

// ============================================================================
// Streak Engine
// ============================================================================

export async function recordSession(input: RecordSessionInput): Promise<StreakEngineResult> {
  const validated = RecordSessionInputSchema.parse(input);
  const streak = await getOrCreateStreak(validated.userId);

  // Check if session qualifies
  if (!isQualifyingSession(validated.duration, validated.qualityScore)) {
    return {
      action: "ALREADY_TODAY",
      previousStreak: streak.currentDays,
      newStreak: streak.currentDays,
      milestoneReached: null,
      shieldUsed: false,
    };
  }

  const sessionDay = getCalendarDay(validated.completedAt, streak.timezone);
  const lastSessionDay = streak.lastQualifyingSessionAt ? getCalendarDay(streak.lastQualifyingSessionAt, streak.timezone) : null;

  // Already completed today
  if (lastSessionDay === sessionDay) {
    return {
      action: "ALREADY_TODAY",
      previousStreak: streak.currentDays,
      newStreak: streak.currentDays,
      milestoneReached: null,
      shieldUsed: false,
    };
  }

  // Calculate streak action
  let action: StreakEngineResult["action"];
  let newStreak = streak.currentDays;
  let shieldUsed = false;
  const hasActiveFreeze = (streak.frozenUntil ?? 0) > validated.completedAt;

  if (!lastSessionDay) {
    // First session ever
    action = "INCREMENTED";
    newStreak = 1;
  } else {
    const yesterday = getCalendarDay(Date.now() - 86400000, streak.timezone);
    const hoursSinceLast = (validated.completedAt - (streak.lastQualifyingSessionAt || 0)) / (1000 * 60 * 60);

    if (hoursSinceLast < 24 || lastSessionDay === yesterday) {
      // Within streak window, increment
      action = "INCREMENTED";
      newStreak = streak.currentDays + 1;
    } else if (hasActiveFreeze) {
      action = "FROZEN";
      newStreak = streak.currentDays + 1;
    } else if (hoursSinceLast < STREAK_WINDOW_HOURS && streak.shieldsAvailable > 0 && !streak.gracePeriodUsed) {
      // Use shield to protect streak
      action = "SHIELD_PROTECTED";
      shieldUsed = true;
      await applyShieldInternal(validated.userId, streak);
    } else {
      // Streak broken
      action = "BROKEN";
      newStreak = 1; // Start new streak
    }
  }

  // Update streak
  const newLongest = Math.max(streak.longestDays, newStreak);
  await repository.updateStreak(validated.userId, {
    currentDays: newStreak,
    longestDays: newLongest,
    lastQualifyingSessionAt: validated.completedAt,
    currentDayCompletedAt: validated.completedAt,
    frozenUntil: hasActiveFreeze ? null : streak.frozenUntil,
  });

  // Check milestone
  const milestone = checkMilestone(newStreak);

  return {
    action,
    previousStreak: streak.currentDays,
    newStreak,
    milestoneReached: milestone,
    shieldUsed,
  };
}

export function isQualifyingSession(duration: number, qualityScore: number): boolean {
  return duration >= QUALIFYING_SESSION_MIN_DURATION && qualityScore >= QUALIFYING_SESSION_MIN_QUALITY;
}

export function getCalendarDay(timestamp: number, timezone: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function checkMilestone(streakDays: number): StreakMilestone | null {
  if (!MILESTONE_DAYS.includes(streakDays)) {
    return null;
  }

  const reward = MILESTONE_REWARDS[streakDays];
  if (!reward) {
    return null;
  }

  return {
    id: v4(),
    days: streakDays,
    name: `${streakDays} Day Streak`,
    description: `Maintained focus for ${streakDays} consecutive days`,
    rewardType: reward.rewardType || "COINS",
    rewardAmount: reward.rewardAmount || 0,
    rewardItemId: null,
    badgeId: reward.badgeId || null,
    achieved: true,
    achievedAt: Date.now(),
  };
}

// ============================================================================
// Streak Protection
// ============================================================================

async function applyShieldInternal(userId: string, streak: Streak): Promise<void> {
  const shieldId = await repository.getAvailableShield(userId);
  if (shieldId) {
    await repository.recordShieldUsed(userId, shieldId);
    await repository.updateStreak(userId, {
      shieldsAvailable: streak.shieldsAvailable - 1,
      gracePeriodUsed: true,
    });
  }
}

export async function useShield(input: UseShieldInput): Promise<boolean> {
  const validated = UseShieldInputSchema.parse(input);
  const streak = await getOrCreateStreak(validated.userId);

  if (streak.shieldsAvailable <= 0) {
    return false;
  }

  await applyShieldInternal(validated.userId, streak);
  return true;
}

export async function freezeStreak(userId: string): Promise<void> {
  const validated = FreezeStreakInputSchema.parse({
    userId,
    durationHours: 24,
  });
  const streak = await getOrCreateStreak(validated.userId);
  const frozenUntil = Date.now() + validated.durationHours * 60 * 60 * 1000;

  await repository.updateStreak(validated.userId, {
    currentDays: streak.currentDays,
    longestDays: streak.longestDays,
    lastQualifyingSessionAt: streak.lastQualifyingSessionAt,
    currentDayCompletedAt: streak.currentDayCompletedAt,
    frozenUntil,
    shieldsAvailable: streak.shieldsAvailable,
    gracePeriodUsed: true,
  });
}

// ============================================================================
// Streak Recovery
// ============================================================================

export async function restoreStreak(input: RestoreStreakInput): Promise<boolean>;
export async function restoreStreak(userId: string, targetDays: number): Promise<boolean>;
export async function restoreStreak(inputOrUserId: RestoreStreakInput | string, targetDays?: number): Promise<boolean> {
  const validated =
    typeof inputOrUserId === "string"
      ? RestoreStreakInputSchema.parse({
          userId: inputOrUserId,
          targetDays,
          source: "SPECIAL_EVENT",
        })
      : RestoreStreakInputSchema.parse(inputOrUserId);
  const streak = await getOrCreateStreak(validated.userId);

  if (validated.targetDays > streak.longestDays) {
    return false;
  }

  await repository.updateStreak(validated.userId, {
    currentDays: validated.targetDays,
    lastQualifyingSessionAt: Date.now(),
  });

  return true;
}

// ============================================================================
// Comeback Detection
// ============================================================================

export async function detectComeback(userId: string): Promise<ComebackState> {
  const streak = await repository.fetchStreak(userId);

  if (!streak || !streak.lastQualifyingSessionAt) {
    return {
      isComeback: false,
      daysAbsent: 0,
      streakBefore: 0,
      streakNow: 0,
      rewardMultiplier: 1,
      streakRestoreEligible: false,
      message: "Ready when you are.",
    };
  }

  const daysAbsent = Math.floor((Date.now() - streak.lastQualifyingSessionAt) / (1000 * 60 * 60 * 24));
  const isComeback = daysAbsent >= 3;
  const streakBefore = streak.currentDays;
  const streakNow = isComeback ? 0 : streak.currentDays;
  const usedRestoreThisMonth = await hasUsedStreakRestoreThisMonth(userId);
  const streakRestoreEligible = isComeback && daysAbsent < 30 && streakBefore >= 3 && !usedRestoreThisMonth;

  return ComebackStateSchema.parse({
    isComeback,
    daysAbsent,
    streakBefore,
    streakNow,
    rewardMultiplier: getComebackMultiplier(daysAbsent),
    streakRestoreEligible,
    message: getComebackMessage(daysAbsent, streakBefore),
  });
}

// ============================================================================
// Risk Calculation
// ============================================================================

export function calculateRiskLevel(streak: Streak): RiskLevel {
  if (streak.currentDays === 0) {
    return "NONE";
  }
  if ((streak.frozenUntil ?? 0) > Date.now()) {
    return "NONE";
  }
  if (!streak.lastQualifyingSessionAt) {
    return "LOW";
  }

  const hoursSinceLast = (Date.now() - streak.lastQualifyingSessionAt) / (1000 * 60 * 60);

  if (hoursSinceLast > 40) {
    return "CRITICAL";
  }
  if (hoursSinceLast > 30) {
    return "HIGH";
  }
  if (hoursSinceLast > 22) {
    return "MEDIUM";
  }
  if (hoursSinceLast > 18) {
    return "LOW";
  }

  return "NONE";
}

function calculateNextDeadline(streak: Streak): number | null {
  if (streak.currentDays === 0 || !streak.lastQualifyingSessionAt) {
    return null;
  }
  return streak.lastQualifyingSessionAt + STREAK_WINDOW_HOURS * 60 * 60 * 1000;
}

// ============================================================================
// Multiplier Calculation
// ============================================================================

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) {
    return 2.0;
  }
  if (streakDays >= 14) {
    return 1.75;
  }
  if (streakDays >= 7) {
    return 1.5;
  }
  if (streakDays >= 3) {
    return 1.25;
  }
  return 1.0;
}

function getComebackMultiplier(daysAbsent: number): number {
  if (daysAbsent >= 30) {
    return 3.0;
  }
  if (daysAbsent >= 7) {
    return 2.0;
  }
  if (daysAbsent >= 3) {
    return 1.5;
  }
  return 1.0;
}

function getComebackMessage(daysAbsent: number, _streakBefore: number): string {
  if (daysAbsent >= 30) {
    return "A legendary return. Let's rebuild something great.";
  }
  if (daysAbsent >= 7) {
    return "It's been a while, but your focus potential hasn't gone anywhere.";
  }
  if (daysAbsent >= 3) {
    return `Welcome back! You were gone ${daysAbsent} days. Pick up where you left off.`;
  }
  return "Ready when you are.";
}
