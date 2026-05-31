import * as repository from './repository';
import { hasUsedStreakRestoreThisMonth } from './restore-quest';
import { ComebackStateSchema, type Streak, type ComebackState, type RiskLevel } from './schemas';

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
      message: 'Ready when you are.',
    };
  }
  const daysAbsent = Math.floor(
    (Date.now() - streak.lastQualifyingSessionAt) / (1000 * 60 * 60 * 24),
  );
  const isComeback = daysAbsent >= 3;
  const streakBefore = streak.currentDays;
  const streakNow = isComeback ? 0 : streak.currentDays;
  const usedRestoreThisMonth = await hasUsedStreakRestoreThisMonth(userId);
  const streakRestoreEligible =
    isComeback && daysAbsent < 30 && streakBefore >= 3 && !usedRestoreThisMonth;
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

export function calculateRiskLevel(streak: Streak): RiskLevel {
  if (streak.currentDays === 0) {return 'NONE';}
  if ((streak.frozenUntil ?? 0) > Date.now()) {return 'NONE';}
  if (!streak.lastQualifyingSessionAt) {return 'LOW';}
  const hoursSinceLast =
    (Date.now() - streak.lastQualifyingSessionAt) / (1000 * 60 * 60);
  if (hoursSinceLast > 40) {return 'CRITICAL';}
  if (hoursSinceLast > 30) {return 'HIGH';}
  if (hoursSinceLast > 22) {return 'MEDIUM';}
  if (hoursSinceLast > 18) {return 'LOW';}
  return 'NONE';
}

export function calculateNextDeadline(streak: Streak): number | null {
  if (streak.currentDays === 0 || !streak.lastQualifyingSessionAt) {
    return null;
  }
  return streak.lastQualifyingSessionAt + 24 * 60 * 60 * 1000;
}

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) {return 2.0;}
  if (streakDays >= 14) {return 1.75;}
  if (streakDays >= 7) {return 1.5;}
  if (streakDays >= 3) {return 1.25;}
  return 1.0;
}

function getComebackMultiplier(daysAbsent: number): number {
  if (daysAbsent >= 30) {return 3.0;}
  if (daysAbsent >= 7) {return 2.0;}
  if (daysAbsent >= 3) {return 1.5;}
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
  return 'Ready when you are.';
}
