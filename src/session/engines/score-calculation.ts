import type {
  SessionState,
  ScoreCalculation,
  FocusQualityMetrics,
} from "../types";
import { getSessionModeConfig } from "../modes";
import { BonusCalculator } from "./scoring/BonusCalculator";
import {
  calculateTimeMultiplier,
  calculateQualityMultiplier,
  calculateModeBonus,
  calculateComebackBonus,
  calculatePausePenalty,
  calculateModePausePenalty,
  calculateInterruptionPenalty,
  calculateQualityPenalty,
  calculateAntiCheatPenalty,
} from "./scoring/scoring-helpers";
import { calculateFinalScore } from "./scoring-utils";

const BASE_SCORE_PER_MINUTE = 25;

export function calculateSessionScore(
  session: SessionState,
  focusMetrics: FocusQualityMetrics,
  userStreak: number,
): ScoreCalculation {
  const completionPercentage = session.completionPercentage;
  const modeConfig = getSessionModeConfig(session.config.sessionMode);
  const basePoints = Math.floor(
    (session.config.duration / 60) * BASE_SCORE_PER_MINUTE,
  );

  const timeMultiplier = calculateTimeMultiplier(completionPercentage);
  const streakMultiplier = BonusCalculator.getStreakMultiplier(userStreak);
  const qualityMultiplier = calculateQualityMultiplier(
    focusMetrics,
    modeConfig.purityPassThreshold,
  );
  const comebackMultiplier = Math.min(
    3,
    Math.max(1, session.config.comebackMultiplier ?? 1),
  );

  const timeBonus = BonusCalculator.calculateTimeBonus({
    plannedDuration: session.config.duration,
    actualDuration: session.effectiveTime,
    completionPercentage,
  });
  const streakBonus = BonusCalculator.calculateStreakBonus({
    currentStreak: userStreak,
    basePoints,
  });
  const qualityBonus = BonusCalculator.calculateQualityBonus({
    focusMetrics,
    interruptions: session.interruptions,
    pauses: session.pauses,
  });
  const intervalBonus = BonusCalculator.calculateIntervalBonus({
    completedIntervals: session.intervalsCompleted,
    totalIntervals: session.totalIntervals,
    allIntervalsCompleted:
      session.intervalsCompleted >= session.totalIntervals,
  });
  const modeBonus = calculateModeBonus(session, focusMetrics, basePoints);

  const pausePenalty =
    calculatePausePenalty(session.pauses, session.config.duration) *
      modeConfig.pausePenaltyMultiplier +
    calculateModePausePenalty(session);
  const interruptionPenalty = calculateInterruptionPenalty(
    session.interruptions,
  );
  const qualityPenalty = calculateQualityPenalty(focusMetrics);
  const antiCheatPenalty = calculateAntiCheatPenalty(session);

  const penaltyMultiplier = Math.max(
    0,
    1 -
      (pausePenalty +
        interruptionPenalty +
        qualityPenalty +
        antiCheatPenalty) /
        Math.max(1, basePoints),
  );
  const comebackBonus = calculateComebackBonus(
    Math.round(basePoints * modeConfig.xpMultiplier),
    timeBonus + streakBonus + qualityBonus + intervalBonus,
    timeMultiplier,
    streakMultiplier,
    qualityMultiplier,
    penaltyMultiplier,
    comebackMultiplier,
  );

  const bonusPoints =
    timeBonus +
    streakBonus +
    qualityBonus +
    intervalBonus +
    comebackBonus +
    modeBonus;
  const calculation: ScoreCalculation = {
    basePoints: Math.round(basePoints * modeConfig.xpMultiplier),
    timeMultiplier,
    streakMultiplier,
    qualityMultiplier,
    penaltyMultiplier,
    comebackMultiplier,
    bonusPoints,
    isPerfect: false,
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

  const finalScore = calculateFinalScore(calculation);
  calculation.isPerfect =
    finalScore >= 95 &&
    session.pauses === 0 &&
    session.effectiveTime >= 30 * 60 &&
    focusMetrics.overallScore >= 95;
  return calculation;
}
