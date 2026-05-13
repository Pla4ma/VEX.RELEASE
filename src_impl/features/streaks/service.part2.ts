import { v4 } from "../../utils/uuid";
import * as repository from "./repository";
import { hasUsedStreakRestoreThisMonth } from "./restore-quest";
import { RecordSessionInputSchema, UseShieldInputSchema, FreezeStreakInputSchema, RestoreStreakInputSchema, ComebackStateSchema, type Streak, type StreakSummary, type StreakMilestone, type StreakEngineResult, type RecordSessionInput, type UseShieldInput, type RestoreStreakInput, type ComebackState, type RiskLevel } from "./schemas";


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

export async function restoreStreak(inputOrUserId: RestoreStreakInput | string, targetDays?: number): Promise<boolean> {
  const validated =
    typeof inputOrUserId === 'string'
      ? RestoreStreakInputSchema.parse({
          userId: inputOrUserId,
          targetDays,
          source: 'SPECIAL_EVENT',
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

  const daysAbsent = Math.floor((Date.now() - streak.lastQualifyingSessionAt) / (1000 * 60 * 60 * 24));
  const isComeback = daysAbsent >= 2;
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

export function calculateRiskLevel(streak: Streak): RiskLevel {
  if (streak.currentDays === 0) {
    return 'NONE';
  }
  if ((streak.frozenUntil ?? 0) > Date.now()) {
    return 'NONE';
  }
  if (!streak.lastQualifyingSessionAt) {
    return 'LOW';
  }

  const hoursSinceLast = (Date.now() - streak.lastQualifyingSessionAt) / (1000 * 60 * 60);

  if (hoursSinceLast > 40) {
    return 'CRITICAL';
  }
  if (hoursSinceLast > 30) {
    return 'HIGH';
  }
  if (hoursSinceLast > 22) {
    return 'MEDIUM';
  }
  if (hoursSinceLast > 18) {
    return 'LOW';
  }

  return 'NONE';
}

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