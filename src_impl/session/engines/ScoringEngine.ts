/**
 * Scoring Engine
 *
 * Comprehensive scoring calculation for sessions.
 * Calculates base scores, bonuses, penalties, and final scores.
 */

import type { SessionState, ScoreCalculation, DamageCalculation, FocusQualityMetrics } from '../types';
import { getSessionModeConfig, getSprintChainMultiplier, resolveSessionMode, SessionMode } from '../modes';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:scoring');

// ============================================================================
// Scoring Constants
// ============================================================================

const BASE_SCORE_PER_MINUTE = 25;
const MIN_COMPLETION_FOR_CREDIT = 0.5; // 50%

const STREAK_MULTIPLIERS: Record<number, number> = {
  0: 1,
  1: 1,
  2: 1.1,
  3: 1.15,
  7: 1.25,
  14: 1.35,
  30: 1.5,
  60: 1.75,
  90: 2,
  180: 2.5,
  365: 3,
};

const QUALITY_THRESHOLDS = {
  EXCELLENT: 95,
  GOOD: 80,
  AVERAGE: 60,
  POOR: 40,
  BAD: 20,
};

// ============================================================================
// Scoring Engine
// ============================================================================

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

  // ============================================================================
  // Score Calculation
  // ============================================================================

  calculateScore(
    session: SessionState,
    focusMetrics: FocusQualityMetrics
  ): ScoreCalculation {
    const duration = session.config.duration;
    const effectiveTime = session.effectiveTime;
    const completionPercentage = session.completionPercentage;
    const interruptions = session.interruptions;
    const pauses = session.pauses;
    const mode = resolveSessionMode(session.config.sessionMode);
    const modeConfig = getSessionModeConfig(mode);

    // Base points from duration
    const basePoints = Math.floor((duration / 60) * BASE_SCORE_PER_MINUTE);

    // Time multiplier based on completion
    const timeMultiplier = this.calculateTimeMultiplier(completionPercentage);

    // Streak multiplier
    const streakMultiplier = this.getStreakMultiplier();

    // Quality multiplier from focus metrics
    const qualityMultiplier = this.calculateQualityMultiplier(focusMetrics, modeConfig.purityPassThreshold);
    const comebackMultiplier = this.getComebackMultiplier(session);

    // Calculate bonuses
    const timeBonus = this.calculateTimeBonus(duration, completionPercentage);
    const streakBonus = this.calculateStreakBonus(basePoints, streakMultiplier);
    const qualityBonus = this.calculateQualityBonus(focusMetrics);
    const intervalBonus = this.calculateIntervalBonus(session);
    const modeBonus = this.calculateModeBonus(session, focusMetrics, basePoints);
    // Calculate penalties
    const pausePenalty =
      this.calculatePausePenalty(pauses, duration) * modeConfig.pausePenaltyMultiplier +
      this.calculateModePausePenalty(session);
    const interruptionPenalty = this.calculateInterruptionPenalty(interruptions);
    const qualityPenalty = this.calculateQualityPenalty(focusMetrics);
    const antiCheatPenalty = this.calculateAntiCheatPenalty(session);

    // Penalty multiplier
    const penaltyMultiplier = Math.max(0, 1 - (
      (pausePenalty + interruptionPenalty + qualityPenalty + antiCheatPenalty) / Math.max(1, basePoints)
    ));
    const comebackBonus = this.calculateComebackBonus(
      Math.round(basePoints * modeConfig.xpMultiplier),
      timeBonus + streakBonus + qualityBonus + intervalBonus,
      timeMultiplier,
      streakMultiplier,
      qualityMultiplier,
      penaltyMultiplier,
      comebackMultiplier,
    );

    // Bonus points total
    const bonusPoints = timeBonus + streakBonus + qualityBonus + intervalBonus + comebackBonus + modeBonus;

    // Build base calculation first
    const calculation: ScoreCalculation = {
      basePoints: Math.round(basePoints * modeConfig.xpMultiplier),
      timeMultiplier,
      streakMultiplier,
      qualityMultiplier,
      penaltyMultiplier,
      comebackMultiplier,
      bonusPoints,
      isPerfect: false, // Will be calculated below
      timeBonus,
      streakBonus,
      qualityBonus,
      intervalBonus: intervalBonus + modeBonus,
      comebackBonus,
      pausePenalty,
      interruptionPenalty,
      qualityPenalty,
      antiCheatPenalty,
    };

    // Calculate perfect session criteria (Phase 9)
    // Perfect = final score >= 95, zero pauses, and at least 30 minutes duration
    const finalScore = this.calculateFinalScore(calculation);
    const focusQualityScore = focusMetrics.overallScore;
    calculation.isPerfect = finalScore >= 95 && pauses === 0 && effectiveTime >= 30 * 60 && focusQualityScore >= 95;

    debug.info('Score calculated for session %s: base=%d, multipliers=%sx%sx%s, penalty=%s, isPerfect=%s',
      session.id, basePoints, timeMultiplier, streakMultiplier, qualityMultiplier, penaltyMultiplier, calculation.isPerfect);

    return calculation;
  }

  calculateFinalScore(calculation: ScoreCalculation): number {
    const baseWithMultipliers = calculation.basePoints *
      calculation.timeMultiplier *
      calculation.streakMultiplier *
      calculation.qualityMultiplier;

    const withPenalties = baseWithMultipliers * calculation.penaltyMultiplier;
    const withBonuses = withPenalties + calculation.bonusPoints;

    return Math.max(0, Math.round(withBonuses));
  }

  // ============================================================================
  // Multiplier Calculations
  // ============================================================================

  private calculateTimeMultiplier(completionPercentage: number): number {
    if (completionPercentage >= 100) {return 1.5;}
    if (completionPercentage >= 90) {return 1.3;}
    if (completionPercentage >= 75) {return 1.15;}
    if (completionPercentage >= 50) {return 1;}
    if (completionPercentage >= 25) {return 0.7;}
    return 0.5;
  }

  private getStreakMultiplier(): number {
    let multiplier = 1;

    for (const [streakDays, mult] of Object.entries(STREAK_MULTIPLIERS)) {
      if (this.userStreak >= parseInt(streakDays)) {
        multiplier = mult;
      }
    }

    return multiplier;
  }

  private getComebackMultiplier(session: SessionState): number {
    return Math.min(3, Math.max(1, session.config.comebackMultiplier ?? 1));
  }

  private calculateQualityMultiplier(
    focusMetrics: FocusQualityMetrics,
    passThreshold = QUALITY_THRESHOLDS.AVERAGE
  ): number {
    const score = focusMetrics.overallScore;

    if (score >= QUALITY_THRESHOLDS.EXCELLENT) {return 1.5;}
    if (score >= QUALITY_THRESHOLDS.GOOD) {return 1.3;}
    if (score >= passThreshold) {return 1.1;}
    if (score >= QUALITY_THRESHOLDS.POOR) {return 0.9;}
    if (score >= QUALITY_THRESHOLDS.BAD) {return 0.7;}
    return 0.5;
  }

  // ============================================================================
  // Bonus Calculations
  // ============================================================================

  private calculateTimeBonus(duration: number, completionPercentage: number): number {
    // Bonus for completing longer sessions
    const durationBonus = Math.floor((duration / 300) * 5); // 5 points per 5 min

    // Bonus for high completion
    const completionBonus = completionPercentage >= 100 ? 50 :
      completionPercentage >= 90 ? 30 :
      completionPercentage >= 75 ? 15 : 0;

    return durationBonus + completionBonus;
  }

  private calculateStreakBonus(basePoints: number, streakMultiplier: number): number {
    // Bonus increases with streak
    if (streakMultiplier > 1) {
      return Math.floor(basePoints * (streakMultiplier - 1) * 0.5);
    }
    return 0;
  }

  private calculateQualityBonus(focusMetrics: FocusQualityMetrics): number {
    const score = focusMetrics.overallScore;

    if (score >= QUALITY_THRESHOLDS.EXCELLENT) {return 100;}
    if (score >= QUALITY_THRESHOLDS.GOOD) {return 50;}
    if (score >= QUALITY_THRESHOLDS.AVERAGE) {return 20;}
    return 0;
  }

  private calculateIntervalBonus(session: SessionState): number {
    // Bonus for completing multiple intervals
    const intervalsCompleted = session.intervalsCompleted;

    if (intervalsCompleted >= 8) {return 80;}
    if (intervalsCompleted >= 4) {return 40;}
    if (intervalsCompleted >= 2) {return 15;}
    return 0;
  }

  private calculateModeBonus(
    session: SessionState,
    focusMetrics: FocusQualityMetrics,
    basePoints: number
  ): number {
    const mode = resolveSessionMode(session.config.sessionMode);

    if (mode === SessionMode.CHALLENGE && focusMetrics.consistencyScore >= 90) {
      return Math.round(this.calculateQualityBonus(focusMetrics) * 0.3);
    }

    if (mode === SessionMode.STUDY) {
      return (session.config.quizBonusPoints ?? 0) + this.getCompletedQuizBonus(session);
    }

    if (mode === SessionMode.CREATIVE) {
      return session.config.creativeMoodBonus ?? 0;
    }

    if (mode === SessionMode.SPRINT) {
      const chainMultiplier = getSprintChainMultiplier(session.config.sprintChainCount ?? 1);
      return Math.round(basePoints * (chainMultiplier - 1));
    }

    return 0;
  }

  private getCompletedQuizBonus(session: SessionState): number {
    const rawCompleted = session.metadata?.studyQuizCorrectAnswers;
    return typeof rawCompleted === 'number' ? Math.max(0, rawCompleted * 5) : 0;
  }

  private calculateComebackBonus(
    basePoints: number,
    baseBonusPoints: number,
    timeMultiplier: number,
    streakMultiplier: number,
    qualityMultiplier: number,
    penaltyMultiplier: number,
    comebackMultiplier: number,
  ): number {
    if (comebackMultiplier <= 1) {return 0;}

    const subtotal = (basePoints * timeMultiplier * streakMultiplier * qualityMultiplier * penaltyMultiplier) + baseBonusPoints;
    return Math.max(0, Math.round(subtotal * (comebackMultiplier - 1)));
  }

  // ============================================================================
  // Penalty Calculations
  // ============================================================================

  private calculatePausePenalty(pauses: number, duration: number): number {
    // Penalty per pause (first 2 are free)
    const freePauses = 2;
    const penalizedPauses = Math.max(0, pauses - freePauses);

    // Scale penalty by duration (longer sessions allow more pauses)
    const durationFactor = Math.min(1, duration / 3600); // Cap at 1 hour

    return penalizedPauses * 5 * (1 + durationFactor);
  }

  private calculateModePausePenalty(session: SessionState): number {
    const mode = resolveSessionMode(session.config.sessionMode);

    if (mode !== SessionMode.CHALLENGE) {
      return 0;
    }

    return session.pausedTime > 30000 ? Math.max(30, (session.baseScore ?? 0) * 0.25) : 0;
  }

  private calculateInterruptionPenalty(interruptions: number): number {
    // Each interruption is a significant penalty
    return interruptions * 15;
  }

  private calculateQualityPenalty(focusMetrics: FocusQualityMetrics): number {
    // Penalty for poor focus quality
    if (focusMetrics.overallScore < QUALITY_THRESHOLDS.BAD) {
      return 30;
    }
    if (focusMetrics.overallScore < QUALITY_THRESHOLDS.POOR) {
      return 15;
    }
    return 0;
  }

  private calculateAntiCheatPenalty(session: SessionState): number {
    // Severe penalties for anti-cheat violations
    switch (session.antiCheatStatus) {
      case 'FAILED':
        return session.baseScore * 0.5; // 50% penalty
      case 'FLAGGED':
        return session.baseScore * 0.2; // 20% penalty
      case 'WARNING':
        return session.baseScore * 0.05; // 5% penalty
      default:
        return 0;
    }
  }

  // ============================================================================
  // Damage Calculation
  // ============================================================================

  calculateDamage(
    session: SessionState,
    reason: 'ABANDON' | 'INTERRUPTION' | 'TIMEOUT' | 'ANTI_CHEAT'
  ): DamageCalculation {
    const baseDamage = session.baseScore * 0.1; // 10% of base score

    let pauseDamage = 0;
    let interruptionDamage = 0;
    let abandonDamage = 0;
    let antiCheatDamage = 0;

    switch (reason) {
      case 'ABANDON':
        abandonDamage = baseDamage * 3;
        pauseDamage = session.pauses * 2;
        interruptionDamage = session.interruptions * 5;
        break;

      case 'INTERRUPTION':
        interruptionDamage = baseDamage * 2;
        pauseDamage = session.pauses;
        break;

      case 'TIMEOUT':
        abandonDamage = baseDamage * 2;
        pauseDamage = session.pauses * 1.5;
        break;

      case 'ANTI_CHEAT':
        antiCheatDamage = baseDamage * 5;
        break;
    }

    // Streak protection reduces damage
    const streakProtection = this.userStreak > 7;
    const mitigation = streakProtection ? 0.5 : 0;

    const totalDamage = (baseDamage + pauseDamage + interruptionDamage +
      abandonDamage + antiCheatDamage) * (1 - mitigation);

    const finalPenalty = Math.min(1, totalDamage / (session.baseScore || 1));

    return {
      baseDamage,
      pauseDamage,
      interruptionDamage,
      abandonDamage,
      antiCheatDamage,
      mitigation,
      streakProtection,
      totalDamage,
      finalPenalty,
    };
  }

  // ============================================================================
  // Focus Quality Calculation
  // ============================================================================

  calculateFocusQuality(
    session: SessionState,
    interruptions: Array<{ duration: number; severity: string; autoRecovered?: boolean }>
  ): FocusQualityMetrics {
    const now = Date.now();
    const sessionDuration = session.config.duration * 1000;
    const modeConfig = getSessionModeConfig(session.config.sessionMode);

    // Calculate time in different focus states
    let timeInDeepFocus = sessionDuration;
    let timeInShallowFocus = 0;
    let timeDistracted = 0;

    const focusSegments: Array<{
      startAt: number;
      endAt: number;
      duration: number;
      quality: number;
    }> = [];

    // Process interruptions
    for (const interruption of interruptions) {
      const duration = interruption.duration;

      if (interruption.severity === 'CRITICAL' || interruption.severity === 'MAJOR') {
        timeDistracted += duration;
        timeInDeepFocus -= duration;
      } else if (interruption.severity === 'MODERATE') {
        timeInShallowFocus += duration;
        timeInDeepFocus -= duration;
      } else {
        timeInShallowFocus += duration * 0.5;
        timeInDeepFocus -= duration * 0.5;
      }
    }

    // Ensure no negative times
    timeInDeepFocus = Math.max(0, timeInDeepFocus);

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(interruptions, sessionDuration);

    // Calculate depth score
    const depthScore = Math.min(100, (timeInDeepFocus / sessionDuration) * 100);

    // Calculate recovery score
    const recoveryScore = this.calculateRecoveryScore(interruptions);

    // Overall score (weighted average)
    const overallScore = Math.round(
      consistencyScore * modeConfig.scoringWeights.consistency +
      depthScore * modeConfig.scoringWeights.depth +
      recoveryScore * modeConfig.scoringWeights.recovery
    );

    return {
      sessionId: session.id,
      timeInDeepFocus,
      timeInShallowFocus,
      timeDistracted,
      focusSegments,
      consistencyScore,
      depthScore,
      recoveryScore,
      overallScore,
      calculatedAt: now,
    };
  }

  calculateFocusPurityScore(session: SessionState): number {
    const sessionStart = session.startedAt ?? session.createdAt;
    const sessionEnd = session.endedAt ?? Date.now();
    const totalSessionTime = Math.max(0, sessionEnd - sessionStart);
    const elapsedFocusTime = Math.max(0, totalSessionTime - session.pausedTime);

    if (totalSessionTime <= 0) {
      return 100;
    }

    return Math.round((elapsedFocusTime / totalSessionTime) * 100);
  }

  private calculateConsistencyScore(
    interruptions: Array<{ duration: number }>,
    totalDuration: number
  ): number {
    if (interruptions.length === 0) {return 100;}

    // More interruptions = lower score
    const interruptionPenalty = interruptions.length * 10;

    // Longer interruptions = more penalty
    const totalInterruptionTime = interruptions.reduce((sum, i) => sum + i.duration, 0);
    const timePenalty = (totalInterruptionTime / totalDuration) * 50;

    return Math.max(0, Math.round(100 - interruptionPenalty - timePenalty));
  }

  private calculateRecoveryScore(
    interruptions: Array<{ autoRecovered?: boolean }>
  ): number {
    if (interruptions.length === 0) {return 100;}

    const recoveredCount = interruptions.filter(i => i.autoRecovered).length;
    return Math.round((recoveredCount / interruptions.length) * 100);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  isEligibleForRewards(completionPercentage: number): boolean {
    return completionPercentage >= MIN_COMPLETION_FOR_CREDIT * 100;
  }

  getCompletionTier(completionPercentage: number): 'NONE' | 'PARTIAL' | 'FULL' | 'PERFECT' {
    if (completionPercentage >= 100) {return 'PERFECT';}
    if (completionPercentage >= 90) {return 'FULL';}
    if (completionPercentage >= MIN_COMPLETION_FOR_CREDIT * 100) {return 'PARTIAL';}
    return 'NONE';
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  serializeCalculation(calculation: ScoreCalculation): Record<string, number> {
    return {
      basePoints: calculation.basePoints,
      timeMultiplier: calculation.timeMultiplier,
      streakMultiplier: calculation.streakMultiplier,
      qualityMultiplier: calculation.qualityMultiplier,
      penaltyMultiplier: calculation.penaltyMultiplier,
      comebackMultiplier: calculation.comebackMultiplier,
      bonusPoints: calculation.bonusPoints,
      timeBonus: calculation.timeBonus,
      streakBonus: calculation.streakBonus,
      qualityBonus: calculation.qualityBonus,
      intervalBonus: calculation.intervalBonus,
      comebackBonus: calculation.comebackBonus,
      pausePenalty: calculation.pausePenalty,
      interruptionPenalty: calculation.interruptionPenalty,
      qualityPenalty: calculation.qualityPenalty,
      antiCheatPenalty: calculation.antiCheatPenalty,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createScoringEngine(): ScoringEngine {
  return new ScoringEngine();
}
