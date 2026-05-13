import { v4 } from "../../utils/uuid";
import * as repository from "./repository";
import { hasUsedStreakRestoreThisMonth } from "./restore-quest";
import { RecordSessionInputSchema, UseShieldInputSchema, FreezeStreakInputSchema, RestoreStreakInputSchema, ComebackStateSchema, type Streak, type StreakSummary, type StreakMilestone, type StreakEngineResult, type RecordSessionInput, type UseShieldInput, type RestoreStreakInput, type ComebackState, type RiskLevel } from "./schemas";


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
    isAtRisk: riskLevel !== 'NONE',
    riskLevel,
    nextDeadline,
    frozenUntil: streak.frozenUntil,
    shieldAvailable: streak.shieldsAvailable > 0,
  };
}

export async function recordSession(input: RecordSessionInput): Promise<StreakEngineResult> {
  const validated = RecordSessionInputSchema.parse(input);
  const streak = await getOrCreateStreak(validated.userId);

  // Check if session qualifies
  if (!isQualifyingSession(validated.duration, validated.qualityScore, validated.sessionMode)) {
    return {
      action: 'ALREADY_TODAY',
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
      action: 'ALREADY_TODAY',
      previousStreak: streak.currentDays,
      newStreak: streak.currentDays,
      milestoneReached: null,
      shieldUsed: false,
    };
  }

  // Calculate streak action
  let action: StreakEngineResult['action'];
  let newStreak = streak.currentDays;
  let shieldUsed = false;
  const hasActiveFreeze = (streak.frozenUntil ?? 0) > validated.completedAt;

  if (!lastSessionDay) {
    // First session ever
    action = 'INCREMENTED';
    newStreak = 1;
  } else {
    const yesterday = getCalendarDay(Date.now() - 86400000, streak.timezone);
    const hoursSinceLast = (validated.completedAt - (streak.lastQualifyingSessionAt || 0)) / (1000 * 60 * 60);

    if (hoursSinceLast < 24 || lastSessionDay === yesterday) {
      // Within streak window, increment
      action = 'INCREMENTED';
      newStreak = streak.currentDays + 1;
    } else if (hasActiveFreeze) {
      action = 'FROZEN';
      newStreak = streak.currentDays + 1;
    } else if (hoursSinceLast < STREAK_WINDOW_HOURS && streak.shieldsAvailable > 0 && !streak.gracePeriodUsed) {
      // Use shield to protect streak
      action = 'SHIELD_PROTECTED';
      shieldUsed = true;
      await applyShieldInternal(validated.userId, streak);
    } else {
      // Streak broken
      action = 'BROKEN';
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

export function isQualifyingSession(duration: number, qualityScore: number, mode?: string): boolean {
  if (mode === 'MAINTENANCE') {
    return duration >= 3 * 60 && qualityScore >= 50;
  }
  return duration >= QUALIFYING_SESSION_MIN_DURATION && qualityScore >= QUALIFYING_SESSION_MIN_QUALITY;
}

export function getCalendarDay(timestamp: number, timezone: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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
    rewardType: reward.rewardType || 'COINS',
    rewardAmount: reward.rewardAmount || 0,
    rewardItemId: null,
    badgeId: reward.badgeId || null,
    achieved: true,
    achievedAt: Date.now(),
  };
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