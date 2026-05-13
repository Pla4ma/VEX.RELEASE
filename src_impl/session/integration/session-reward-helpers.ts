import { BonusCalculator } from '../engines/scoring/BonusCalculator';
import { getSessionModeConfig, getRecoveryChainMultiplier, resolveSessionMode, SessionMode } from '../modes';
import { eventBus } from '../../events';
import {
  buildDailyModifierSummary,
  getDailyCoinMultiplier,
} from '../../features/live-ops/daily-modifiers';
import type { RewardCalculationResult } from './session-reward-types'; export type { RewardCalculationResult } from './session-reward-types';
import type { SessionSummary } from '../../session/types';

function calculateModeDifficultyBonus(mode: SessionMode, baseXP: number, summary: SessionSummary): number {
  if (mode === SessionMode.CHALLENGE && summary.focusQuality >= 85 && summary.completionPercentage >= 100) {
    return Math.round(baseXP * 0.2);
  }
  if (mode === SessionMode.CREATIVE && summary.actualDuration >= 45 * 60000) {
    return Math.round(baseXP * 0.15);
  }
  if (mode === SessionMode.RECOVERY && summary.pauses === 0 && summary.interruptions === 0) {
    return Math.round(baseXP * 0.1);
  }
  return 0;
}

export * from "./session-reward-helpers.part1";
export * from "./session-reward-helpers.part2";
