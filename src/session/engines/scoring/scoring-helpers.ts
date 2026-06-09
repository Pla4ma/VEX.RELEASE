import type { SessionState, FocusQualityMetrics } from '../../types';
import {
  _getSessionModeConfig,
  getSprintChainMultiplier,
  resolveSessionMode,
  SessionMode,
} from '../../modes';
import { BonusCalculator } from '../scoring/BonusCalculator';

export const QUALITY_THRESHOLDS = {
  EXCELLENT: 95,
  GOOD: 80,
  AVERAGE: 60,
  POOR: 40,
  BAD: 20,
} as const;

export function calculateTimeMultiplier(completionPercentage: number): number {
  if (completionPercentage >= 100) {return 1.5;}
  if (completionPercentage >= 90) {return 1.3;}
  if (completionPercentage >= 75) {return 1.15;}
  if (completionPercentage >= 50) {return 1;}
  if (completionPercentage >= 25) {return 0.7;}
  return 0.5;
}

export function calculateQualityMultiplier(
  focusMetrics: FocusQualityMetrics,
  passThreshold: number = QUALITY_THRESHOLDS.AVERAGE,
): number {
  const score = focusMetrics.overallScore;
  if (score >= QUALITY_THRESHOLDS.EXCELLENT) {return 1.5;}
  if (score >= QUALITY_THRESHOLDS.GOOD) {return 1.3;}
  if (score >= passThreshold) {return 1.1;}
  if (score >= QUALITY_THRESHOLDS.POOR) {return 0.9;}
  if (score >= QUALITY_THRESHOLDS.BAD) {return 0.7;}
  return 0.5;
}

export function calculateModeBonus(
  session: SessionState,
  focusMetrics: FocusQualityMetrics,
  basePoints: number,
): number {
  const mode = resolveSessionMode(session.config.sessionMode);
  if (mode === SessionMode.CHALLENGE && focusMetrics.consistencyScore >= 90) {
    return Math.round(
      BonusCalculator.calculateQualityBonus({
        focusMetrics,
        interruptions: session.interruptions,
        pauses: session.pauses,
      }) * 0.3,
    );
  }
  if (mode === SessionMode.STUDY) {
    return (
      (session.config.quizBonusPoints ?? 0) + getCompletedQuizBonus(session)
    );
  }
  if (mode === SessionMode.CREATIVE)
    {return session.config.creativeMoodBonus ?? 0;}
  if (mode === SessionMode.SPRINT) {
    const chainMultiplier = getSprintChainMultiplier(
      session.config.sprintChainCount ?? 1,
    );
    return Math.round(basePoints * (chainMultiplier - 1));
  }
  return 0;
}

function getCompletedQuizBonus(session: SessionState): number {
  const raw = session.metadata?.studyQuizCorrectAnswers;
  return typeof raw === 'number' ? Math.max(0, raw * 5) : 0;
}

export function calculateComebackBonus(
  basePoints: number,
  baseBonusPoints: number,
  timeMultiplier: number,
  streakMultiplier: number,
  qualityMultiplier: number,
  penaltyMultiplier: number,
  comebackMultiplier: number,
): number {
  if (comebackMultiplier <= 1) {return 0;}
  const subtotal =
    basePoints *
      timeMultiplier *
      streakMultiplier *
      qualityMultiplier *
      penaltyMultiplier +
    baseBonusPoints;
  return Math.max(0, Math.round(subtotal * (comebackMultiplier - 1)));
}

export function calculatePausePenalty(
  pauses: number,
  duration: number,
): number {
  const freePauses = 2;
  const penalizedPauses = Math.max(0, pauses - freePauses);
  const durationFactor = Math.min(1, duration / 3600);
  return penalizedPauses * 5 * (1 + durationFactor);
}

export function calculateModePausePenalty(session: SessionState): number {
  const mode = resolveSessionMode(session.config.sessionMode);
  if (mode !== SessionMode.CHALLENGE) {return 0;}
  return session.pausedTime > 30000
    ? Math.max(30, (session.baseScore ?? 0) * 0.25)
    : 0;
}

export function calculateInterruptionPenalty(interruptions: number): number {
  return interruptions * 15;
}

export function calculateQualityPenalty(
  focusMetrics: FocusQualityMetrics,
): number {
  if (focusMetrics.overallScore < QUALITY_THRESHOLDS.BAD) {return 30;}
  if (focusMetrics.overallScore < QUALITY_THRESHOLDS.POOR) {return 15;}
  return 0;
}

export function calculateAntiCheatPenalty(session: SessionState): number {
  switch (session.antiCheatStatus) {
    case 'FAILED':
      return session.baseScore * 0.5;
    case 'FLAGGED':
      return session.baseScore * 0.2;
    case 'WARNING':
      return session.baseScore * 0.05;
    default:
      return 0;
  }
}

export function calculateConsistencyScore(
  interruptions: Array<{ duration: number }>,
  totalDuration: number,
): number {
  if (interruptions.length === 0) {return 100;}
  const interruptionPenalty = interruptions.length * 10;
  const totalInterruptionTime = interruptions.reduce(
    (sum, i) => sum + i.duration,
    0,
  );
  const timePenalty = (totalInterruptionTime / totalDuration) * 50;
  return Math.max(0, Math.round(100 - interruptionPenalty - timePenalty));
}

export function calculateRecoveryScore(
  interruptions: Array<{ autoRecovered?: boolean }>,
): number {
  if (interruptions.length === 0) {return 100;}
  const recoveredCount = interruptions.filter((i) => i.autoRecovered).length;
  return Math.round((recoveredCount / interruptions.length) * 100);
}
