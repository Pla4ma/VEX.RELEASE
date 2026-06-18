import type {
  SessionState,
  ScoreCalculation,
  DamageCalculation,
  FocusQualityMetrics,
} from '../types';

import { calculateDamage } from './DamageCalculator';
import { createDebugger } from '../../../utils/debug';
import { calculateSessionScore } from './score-calculation';
import {
  calculateFocusQuality as calcFocusQuality,
  calculateFocusPurityScore as calcFocusPurityScore,
} from './focus-quality-calculator';
import {
  calculateFinalScore as calcFinalScore,
  isEligibleForRewards as checkEligible,
  getCompletionTier as resolveTier,
  serializeCalculation as serialize,
} from './scoring-utils';

export {
  calculateFinalScore,
  isEligibleForRewards,
  getCompletionTier,
  serializeCalculation,
} from './scoring-utils';
export {
  calculateFocusQuality,
  calculateFocusPurityScore,
} from './focus-quality-calculator';

const debug = createDebugger('session:scoring');

export class ScoringEngine {
  private userStreak: number = 0;
  private userLevel: number = 1;

  setUserStats(streak: number, level: number): void {
    this.userStreak = streak;
    this.userLevel = level;
  }

  getUserLevel(): number {
    return this.userLevel;
  }

  calculateScore(
    session: SessionState,
    focusMetrics: FocusQualityMetrics,
  ): ScoreCalculation {
    const calculation = calculateSessionScore(
      session,
      focusMetrics,
      this.userStreak,
    );
    debug.info(
      'Score calculated for session %s: base=%d, final=%d, isPerfect=%s',
      session.id,
      calculation.basePoints,
      calcFinalScore(calculation),
      calculation.isPerfect,
    );
    return calculation;
  }

  calculateFinalScore(calc: ScoreCalculation): number {
    return calcFinalScore(calc);
  }

  calculateDamage(
    session: SessionState,
    reason: 'ABANDON' | 'INTERRUPTION' | 'TIMEOUT' | 'ANTI_CHEAT',
  ): DamageCalculation {
    return calculateDamage(session, this.userStreak, reason);
  }

  calculateFocusQuality(
    session: SessionState,
    interruptions: Array<{
      duration: number;
      severity: string;
      autoRecovered?: boolean;
    }>,
  ): FocusQualityMetrics {
    return calcFocusQuality(session, interruptions);
  }

  calculateFocusPurityScore(session: SessionState): number {
    return calcFocusPurityScore(session);
  }

  isEligibleForRewards(completionPercentage: number): boolean {
    return checkEligible(completionPercentage);
  }

  getCompletionTier(
    completionPercentage: number,
  ): 'NONE' | 'PARTIAL' | 'FULL' | 'PERFECT' {
    return resolveTier(completionPercentage);
  }

  serializeCalculation(calculation: ScoreCalculation): Record<string, number> {
    return serialize(calculation);
  }
}

export function createScoringEngine(): ScoringEngine {
  return new ScoringEngine();
}
