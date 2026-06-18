import { PENALTY_CONSTANTS } from './penalty-constants';
import type {
  PausePenaltyInput,
  InterruptionSeverity,
  InterruptionPenaltyInput,
  QualityPenaltyInput,
  InterruptionPenaltyResult,
} from './penalty-types';

export function calculatePausePenalty(input: PausePenaltyInput): number {
  const { pauseCount, totalPauseDurationSeconds } = input;
  if (pauseCount === 0) {return 0;}
  const basePenalty = pauseCount * PENALTY_CONSTANTS.PAUSE_PENALTY_BASE;
  const pauseMinutes = totalPauseDurationSeconds / 60;
  const durationPenalty =
    pauseMinutes * PENALTY_CONSTANTS.PAUSE_PENALTY_PER_MINUTE;
  const total = basePenalty + durationPenalty;
  return Math.min(total, PENALTY_CONSTANTS.PAUSE_PENALTY_MAX);
}

export function calculateInterruptionPenalty(
  input: InterruptionPenaltyInput,
): InterruptionPenaltyResult {
  const { interruptions } = input;
  if (interruptions.length === 0) {
    return {
      total: 0,
      breakdown: { MINOR: 0, MODERATE: 0, MAJOR: 0, CRITICAL: 0 },
    };
  }
  const severityMultipliers: Record<InterruptionSeverity, number> = {
    MINOR: 0.5,
    MODERATE: 1,
    MAJOR: 2,
    CRITICAL: 4,
  };
  const breakdown: Record<InterruptionSeverity, number> = {
    MINOR: 0,
    MODERATE: 0,
    MAJOR: 0,
    CRITICAL: 0,
  };
  let total = 0;
  for (const interruption of interruptions) {
    const base = interruption.autoRecovered
      ? PENALTY_CONSTANTS.INTERRUPTION_PENALTY_MINOR
      : PENALTY_CONSTANTS.INTERRUPTION_PENALTY_BASE;
    const penalty = base * severityMultipliers[interruption.severity];
    total += penalty;
    breakdown[interruption.severity] += penalty;
  }
  return {
    total: Math.min(total, PENALTY_CONSTANTS.INTERRUPTION_PENALTY_MAX),
    breakdown,
  };
}

export function getSeverityFromTimeLost(
  timeLostSeconds: number,
): InterruptionSeverity {
  if (timeLostSeconds > 300) {return 'CRITICAL';}
  if (timeLostSeconds > 120) {return 'MAJOR';}
  if (timeLostSeconds > 30) {return 'MODERATE';}
  return 'MINOR';
}

export function calculateQualityPenalty(input: QualityPenaltyInput): number {
  const { focusMetrics, distractionTime, totalSessionTime } = input;
  if (totalSessionTime === 0) {return 0;}
  const distractionRatio = distractionTime / totalSessionTime;
  const overallScore = focusMetrics.overallScore;
  let penalty = 0;
  if (distractionRatio > 0.5) {
    penalty = PENALTY_CONSTANTS.BAD_QUALITY_PENALTY;
  } else if (distractionRatio > 0.3) {
    penalty = PENALTY_CONSTANTS.POOR_QUALITY_PENALTY;
  }
  if (overallScore < PENALTY_CONSTANTS.BAD_QUALITY_THRESHOLD) {
    penalty += PENALTY_CONSTANTS.BAD_QUALITY_PENALTY;
  } else if (overallScore < PENALTY_CONSTANTS.POOR_QUALITY_THRESHOLD) {
    penalty += PENALTY_CONSTANTS.POOR_QUALITY_PENALTY;
  }
  return penalty;
}
