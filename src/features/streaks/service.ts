import { v4 } from '../../utils/uuid';
import * as repository from './repository';
import { applyShieldInternal } from './service-shields';
import {
  RecordSessionInputSchema,
  type Streak,
  type StreakSummary,
  type StreakMilestone,
  type StreakEngineResult,
  type RecordSessionInput,
} from './schemas';
import { calculateRiskLevel, calculateNextDeadline } from './service-comeback';

const QUALIFYING_SESSION_MIN_DURATION = 10 * 60;
const QUALIFYING_SESSION_MIN_QUALITY = 50;
const STREAK_WINDOW_HOURS = 24;
const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100, 180, 365];
const MILESTONE_REWARDS: Record<number, Partial<StreakMilestone>> = {
  3: { rewardType: 'COINS', rewardAmount: 100, badgeId: 'streak-3' },
  7: { rewardType: 'COINS', rewardAmount: 250, badgeId: 'streak-7' },
  14: { rewardType: 'GEMS', rewardAmount: 25, badgeId: 'streak-14' },
  30: { rewardType: 'STREAK_SHIELD', rewardAmount: 1, badgeId: 'streak-30' },
  60: { rewardType: 'GEMS', rewardAmount: 100, badgeId: 'streak-60' },
  100: { rewardType: 'GEMS', rewardAmount: 250, badgeId: 'streak-100' },
  180: { rewardType: 'GEMS', rewardAmount: 500, badgeId: 'streak-180' },
  365: { rewardType: 'GEMS', rewardAmount: 1000, badgeId: 'streak-365' },
};

export { useShield, freezeStreak, restoreStreak } from './service-shields';
export {
  detectComeback,
  calculateRiskLevel,
  calculateNextDeadline,
  getStreakMultiplier,
} from './service-comeback';

export async function getOrCreateStreak(userId: string): Promise<Streak> {
  let streak = await repository.fetchStreak(userId);
  if (!streak) {
    streak = await repository.createStreak(userId);
  }
  return streak;
}

export async function getStreakSummary(
  userId: string,
): Promise<StreakSummary | null> {
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

export async function recordSession(
  input: RecordSessionInput,
): Promise<StreakEngineResult> {
  const validated = RecordSessionInputSchema.parse(input);
  const streak = await getOrCreateStreak(validated.userId);
  if (!isQualifyingSession(validated.duration, validated.qualityScore)) {
    return {
      action: 'ALREADY_TODAY',
      previousStreak: streak.currentDays,
      newStreak: streak.currentDays,
      milestoneReached: null,
      shieldUsed: false,
    };
  }
  const sessionDay = getCalendarDay(validated.completedAt, streak.timezone);
  const lastSessionDay = streak.lastQualifyingSessionAt
    ? getCalendarDay(streak.lastQualifyingSessionAt, streak.timezone)
    : null;
  if (lastSessionDay === sessionDay) {
    return {
      action: 'ALREADY_TODAY',
      previousStreak: streak.currentDays,
      newStreak: streak.currentDays,
      milestoneReached: null,
      shieldUsed: false,
    };
  }
  let action: StreakEngineResult['action'];
  let newStreak = streak.currentDays;
  let shieldUsed = false;
  const hasActiveFreeze = (streak.frozenUntil ?? 0) > validated.completedAt;
  if (!lastSessionDay) {
    action = 'INCREMENTED';
    newStreak = 1;
  } else {
    const yesterday = getCalendarDay(Date.now() - 86400000, streak.timezone);
    const hoursSinceLast =
      (validated.completedAt - (streak.lastQualifyingSessionAt || 0)) /
      (1000 * 60 * 60);
    if (hoursSinceLast < 24 || lastSessionDay === yesterday) {
      action = 'INCREMENTED';
      newStreak = streak.currentDays + 1;
    } else if (hasActiveFreeze) {
      action = 'FROZEN';
      newStreak = streak.currentDays + 1;
    } else if (
      hoursSinceLast < STREAK_WINDOW_HOURS &&
      streak.shieldsAvailable > 0 &&
      !streak.gracePeriodUsed
    ) {
      action = 'SHIELD_PROTECTED';
      shieldUsed = true;
      await applyShieldInternal(validated.userId, streak);
    } else {
      action = 'BROKEN';
      newStreak = 1;
    }
  }
  const newLongest = Math.max(streak.longestDays, newStreak);
  await repository.updateStreak(validated.userId, {
    currentDays: newStreak,
    longestDays: newLongest,
    lastQualifyingSessionAt: validated.completedAt,
    currentDayCompletedAt: validated.completedAt,
    frozenUntil: hasActiveFreeze ? null : streak.frozenUntil,
  });
  const milestone = checkMilestone(newStreak);
  return {
    action,
    previousStreak: streak.currentDays,
    newStreak,
    milestoneReached: milestone,
    shieldUsed,
  };
}

export function isQualifyingSession(
  duration: number,
  qualityScore: number,
): boolean {
  return (
    duration >= QUALIFYING_SESSION_MIN_DURATION &&
    qualityScore >= QUALIFYING_SESSION_MIN_QUALITY
  );
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
