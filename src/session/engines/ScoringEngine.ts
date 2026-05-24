import type { SessionState, ScoreCalculation, DamageCalculation, FocusQualityMetrics } from "../types";
import { getSessionModeConfig, resolveSessionMode } from "../modes";
import { BonusCalculator } from "./scoring/BonusCalculator";
import { calculateDamage } from "./DamageCalculator";
import {
  QUALITY_THRESHOLDS,
  calculateTimeMultiplier,
  calculateQualityMultiplier,
  calculateModeBonus,
  calculateComebackBonus,
  calculatePausePenalty,
  calculateModePausePenalty,
  calculateInterruptionPenalty,
  calculateQualityPenalty,
  calculateAntiCheatPenalty,
  calculateConsistencyScore,
  calculateRecoveryScore,
} from "./scoring/scoring-helpers";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("session:scoring");
const BASE_SCORE_PER_MINUTE = 25;
const MIN_COMPLETION_FOR_CREDIT = 0.5;

export class ScoringEngine {
  private userStreak: number = 0;
  private userLevel: number = 1;

  setUserStats(streak: number, level: number): void {
    this.userStreak = streak;
    this.userLevel = level;
  }
  getUserLevel(): number { return this.userLevel; }

  calculateScore(session: SessionState, focusMetrics: FocusQualityMetrics): ScoreCalculation {
    const completionPercentage = session.completionPercentage;
    const modeConfig = getSessionModeConfig(session.config.sessionMode);
    const basePoints = Math.floor((session.config.duration / 60) * BASE_SCORE_PER_MINUTE);

    const timeMultiplier = calculateTimeMultiplier(completionPercentage);
    const streakMultiplier = BonusCalculator.getStreakMultiplier(this.userStreak);
    const qualityMultiplier = calculateQualityMultiplier(focusMetrics, modeConfig.purityPassThreshold);
    const comebackMultiplier = Math.min(3, Math.max(1, session.config.comebackMultiplier ?? 1));

    const timeBonus = BonusCalculator.calculateTimeBonus({
      plannedDuration: session.config.duration,
      actualDuration: session.effectiveTime,
      completionPercentage,
    });
    const streakBonus = BonusCalculator.calculateStreakBonus({ currentStreak: this.userStreak, basePoints });
    const qualityBonus = BonusCalculator.calculateQualityBonus({
      focusMetrics, interruptions: session.interruptions, pauses: session.pauses,
    });
    const intervalBonus = BonusCalculator.calculateIntervalBonus({
      completedIntervals: session.intervalsCompleted,
      totalIntervals: session.totalIntervals,
      allIntervalsCompleted: session.intervalsCompleted >= session.totalIntervals,
    });
    const modeBonus = calculateModeBonus(session, focusMetrics, basePoints);

    const pausePenalty = calculatePausePenalty(session.pauses, session.config.duration) * modeConfig.pausePenaltyMultiplier
      + calculateModePausePenalty(session);
    const interruptionPenalty = calculateInterruptionPenalty(session.interruptions);
    const qualityPenalty = calculateQualityPenalty(focusMetrics);
    const antiCheatPenalty = calculateAntiCheatPenalty(session);

    const penaltyMultiplier = Math.max(0, 1 - (pausePenalty + interruptionPenalty + qualityPenalty + antiCheatPenalty) / Math.max(1, basePoints));
    const comebackBonus = calculateComebackBonus(
      Math.round(basePoints * modeConfig.xpMultiplier),
      timeBonus + streakBonus + qualityBonus + intervalBonus,
      timeMultiplier, streakMultiplier, qualityMultiplier, penaltyMultiplier, comebackMultiplier,
    );

    const bonusPoints = timeBonus + streakBonus + qualityBonus + intervalBonus + comebackBonus + modeBonus;
    const calculation: ScoreCalculation = {
      basePoints: Math.round(basePoints * modeConfig.xpMultiplier),
      timeMultiplier, streakMultiplier, qualityMultiplier, penaltyMultiplier, comebackMultiplier,
      bonusPoints, isPerfect: false,
      timeBonus, streakBonus, qualityBonus, intervalBonus: intervalBonus + modeBonus,
      comebackBonus, pausePenalty, interruptionPenalty, qualityPenalty, antiCheatPenalty,
    };

    const finalScore = this.calculateFinalScore(calculation);
    calculation.isPerfect = finalScore >= 95 && session.pauses === 0 && session.effectiveTime >= 30 * 60 && focusMetrics.overallScore >= 95;
    debug.info(
      "Score calculated for session %s: base=%d, time=%s, streak=%s, quality=%s, penalty=%s, bonus=%d, final=%d, isPerfect=%s",
      session.id, calculation.basePoints,
      calculation.timeMultiplier.toFixed(2), calculation.streakMultiplier.toFixed(2),
      calculation.qualityMultiplier.toFixed(2), calculation.penaltyMultiplier.toFixed(2),
      calculation.bonusPoints, finalScore, calculation.isPerfect,
    );
    return calculation;
  }

  calculateFinalScore(calc: ScoreCalculation): number {
    const base = calc.basePoints * calc.timeMultiplier * calc.streakMultiplier * calc.qualityMultiplier;
    return Math.max(0, Math.round(base * calc.penaltyMultiplier + calc.bonusPoints));
  }

  calculateDamage(session: SessionState, reason: "ABANDON" | "INTERRUPTION" | "TIMEOUT" | "ANTI_CHEAT"): DamageCalculation {
    return calculateDamage(session, this.userStreak, reason);
  }

  calculateFocusQuality(
    session: SessionState,
    interruptions: Array<{ duration: number; severity: string; autoRecovered?: boolean }>,
  ): FocusQualityMetrics {
    const now = Date.now();
    const sessionDuration = session.config.duration * 1000;
    const modeConfig = getSessionModeConfig(session.config.sessionMode);
    let timeInDeepFocus = sessionDuration;
    let timeInShallowFocus = 0;
    let timeDistracted = 0;

    for (const it of interruptions) {
      if (it.severity === "CRITICAL" || it.severity === "MAJOR") {
        timeDistracted += it.duration;
        timeInDeepFocus -= it.duration;
      } else if (it.severity === "MODERATE") {
        timeInShallowFocus += it.duration;
        timeInDeepFocus -= it.duration;
      } else {
        timeInShallowFocus += it.duration * 0.5;
        timeInDeepFocus -= it.duration * 0.5;
      }
    }
    timeInDeepFocus = Math.max(0, timeInDeepFocus);
    const consistencyScore = calculateConsistencyScore(interruptions, sessionDuration);
    const depthScore = Math.min(100, (timeInDeepFocus / sessionDuration) * 100);
    const recoveryScore = calculateRecoveryScore(interruptions);
    const overallScore = Math.round(
      consistencyScore * modeConfig.scoringWeights.consistency +
      depthScore * modeConfig.scoringWeights.depth +
      recoveryScore * modeConfig.scoringWeights.recovery,
    );
    return {
      sessionId: session.id, timeInDeepFocus, timeInShallowFocus, timeDistracted,
      focusSegments: [], consistencyScore, depthScore, recoveryScore, overallScore, calculatedAt: now,
    };
  }

  calculateFocusPurityScore(session: SessionState): number {
    const sessionStart = session.startedAt ?? session.createdAt;
    const sessionEnd = session.endedAt ?? Date.now();
    const totalSessionTime = Math.max(0, sessionEnd - sessionStart);
    const elapsedFocusTime = Math.max(0, totalSessionTime - session.pausedTime);
    return totalSessionTime <= 0 ? 100 : Math.round((elapsedFocusTime / totalSessionTime) * 100);
  }

  isEligibleForRewards(completionPercentage: number): boolean {
    return completionPercentage >= MIN_COMPLETION_FOR_CREDIT * 100;
  }

  getCompletionTier(completionPercentage: number): "NONE" | "PARTIAL" | "FULL" | "PERFECT" {
    if (completionPercentage >= 100) return "PERFECT";
    if (completionPercentage >= 90) return "FULL";
    if (completionPercentage >= MIN_COMPLETION_FOR_CREDIT * 100) return "PARTIAL";
    return "NONE";
  }

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

export function createScoringEngine(): ScoringEngine {
  return new ScoringEngine();
}
