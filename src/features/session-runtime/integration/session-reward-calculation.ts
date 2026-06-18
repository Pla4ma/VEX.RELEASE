import type { SessionSummary } from '../../../session/types';
import { BonusCalculator } from '../engines/scoring/BonusCalculator';
import {
  getRecoveryChainMultiplier,
  getSessionModeConfig,
  resolveSessionMode,
  SessionMode,
} from '../modes';
import type { RewardCalculationResult } from './session-reward-types';

export function calculateRewards(
  streakDays: number,
  summary: SessionSummary,
): RewardCalculationResult {
  const durationMinutes = Math.max(
    0,
    Math.floor(summary.effectiveDuration / 60000),
  );
  const mode = resolveSessionMode(summary.sessionMode);
  const modeConfig = getSessionModeConfig(mode);
  const recoveryMultiplier =
    mode === SessionMode.RECOVERY
      ? getRecoveryChainMultiplier(
          Math.max(1, Math.round(summary.modeBonus / 5) + 1),
        )
      : 1;
  const baseXP = durationMinutes * 10;
  const timeBonus = BonusCalculator.calculateTimeBonus({
    plannedDuration: summary.plannedDuration,
    actualDuration: summary.actualDuration,
    completionPercentage: summary.completionPercentage,
  });
  const streakBonus = BonusCalculator.calculateStreakBonus({
    currentStreak: streakDays,
    basePoints: baseXP,
  });
  const streakMultiplier = BonusCalculator.getStreakMultiplier(streakDays);
  const perfectSession =
    summary.interruptions === 0 &&
    summary.pauses === 0 &&
    summary.completionPercentage >= 100;
  const focusQuality = summary.focusPurityScore ?? summary.focusQuality;
  const adjustedQuality = Math.max(
    0,
    focusQuality - summary.interruptions * 5 - summary.pauses * 2,
  );
  const qualityXP =
    adjustedQuality >= 95
      ? 150
      : adjustedQuality >= 85
        ? 90
        : adjustedQuality >= 75
          ? 50
          : 0;
  const difficultyXP = calculateModeDifficultyBonus(mode, baseXP, summary);
  const modeXP = Math.round(
    baseXP * modeConfig.xpMultiplier * recoveryMultiplier,
  );
  const preModifierXP =
    modeXP +
    timeBonus +
    streakBonus +
    qualityXP +
    difficultyXP +
    (perfectSession ? 100 : 0);

  return {
    baseXP: modeXP,
    baseCoins: 0,
    baseGems: 0,
    streakBonus: { xp: streakBonus, coins: 0 },
    qualityBonus: { xp: qualityXP, coins: 0 },
    difficultyBonus: { xp: difficultyXP, coins: 0 },
    dailyModifierBonus: {
      xp: 0,
      coins: 0,
      modifierId: null,
    },
    timeBonus: { xp: timeBonus, coins: 0 },
    perfectSessionBonus: perfectSession
      ? { xp: 100, coins: 0, gems: 0 }
      : { xp: 0, coins: 0, gems: 0 },
    streakMultiplier,
    finalMultiplier:
      streakMultiplier * modeConfig.xpMultiplier * recoveryMultiplier,
    totalXP: Math.floor(preModifierXP * streakMultiplier),
    totalCoins: 0,
    totalGems: 0,
    streakDays,
    streakIncreased: false,
    achievementsUnlocked: [],
    challengesProgressed: [],
    milestoneReached: null,
    socialActivityId: null,
  };
}

function calculateModeDifficultyBonus(
  mode: SessionMode,
  baseXP: number,
  summary: SessionSummary,
): number {
  if (
    mode === SessionMode.CHALLENGE &&
    summary.focusQuality >= 85 &&
    summary.completionPercentage >= 100
  ) {
    return Math.round(baseXP * 0.2);
  }
  if (mode === SessionMode.CREATIVE && summary.actualDuration >= 45 * 60000) {
    return Math.round(baseXP * 0.15);
  }
  if (
    mode === SessionMode.RECOVERY &&
    summary.pauses === 0 &&
    summary.interruptions === 0
  ) {
    return Math.round(baseXP * 0.1);
  }
  return 0;
}
