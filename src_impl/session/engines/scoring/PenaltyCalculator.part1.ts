import type { FocusQualityMetrics } from "../../types";


export const PENALTY_CONSTANTS = {
  // Pause penalties
  PAUSE_PENALTY_BASE: 5,
  PAUSE_PENALTY_PER_MINUTE: 2,
  PAUSE_PENALTY_MAX: 100,

  // Interruption penalties
  INTERRUPTION_PENALTY_BASE: 10,
  INTERRUPTION_PENALTY_SEVERE: 25,
  INTERRUPTION_PENALTY_MINOR: 5,
  INTERRUPTION_PENALTY_MAX: 200,

  // Quality penalties
  POOR_QUALITY_THRESHOLD: 40,
  BAD_QUALITY_THRESHOLD: 20,
  POOR_QUALITY_PENALTY: 50,
  BAD_QUALITY_PENALTY: 100,

  // Anti-cheat penalties
  TIME_MANIPULATION_PENALTY: 500,
  DEVICE_CHANGE_PENALTY: 250,
  RAPID_COMPLETION_PENALTY: 300,
  SUSPICIOUS_PATTERN_PENALTY: 400,

  // Abandon penalties
  ABANDON_BASE_PENALTY: 100,
  ABANDON_STREAK_RISK_MULTIPLIER: 2,
  ABANDON_PROGRESS_FACTOR: 0.5,

  // Penalty caps
  MAX_TOTAL_PENALTY_PERCENTAGE: 0.8, // Can't lose more than 80% of score
} as const;

export function calculatePausePenalty(input: PausePenaltyInput): number {
  const { pauseCount, totalPauseDurationSeconds } = input;

  if (pauseCount === 0) {return 0;}

  // Base penalty per pause
  const basePenalty = pauseCount * PENALTY_CONSTANTS.PAUSE_PENALTY_BASE;

  // Duration penalty
  const pauseMinutes = totalPauseDurationSeconds / 60;
  const durationPenalty = pauseMinutes * PENALTY_CONSTANTS.PAUSE_PENALTY_PER_MINUTE;

  const total = basePenalty + durationPenalty;

  return Math.min(total, PENALTY_CONSTANTS.PAUSE_PENALTY_MAX);
}

export function calculateInterruptionPenalty(input: InterruptionPenaltyInput): {
  total: number;
  breakdown: Record<InterruptionSeverity, number>;
} {
  const { interruptions } = input;

  if (interruptions.length === 0) {
    return { total: 0, breakdown: { MINOR: 0, MODERATE: 0, MAJOR: 0, CRITICAL: 0 } };
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

export function getSeverityFromTimeLost(timeLostSeconds: number): InterruptionSeverity {
  if (timeLostSeconds > 300) {return 'CRITICAL';} // > 5 minutes
  if (timeLostSeconds > 120) {return 'MAJOR';}    // > 2 minutes
  if (timeLostSeconds > 30) {return 'MODERATE';}  // > 30 seconds
  return 'MINOR';
}

export function calculateQualityPenalty(input: QualityPenaltyInput): number {
  const { focusMetrics, distractionTime, totalSessionTime } = input;

  if (totalSessionTime === 0) {return 0;}

  const distractionRatio = distractionTime / totalSessionTime;
  const overallScore = focusMetrics.overallScore;

  // Penalty based on distraction ratio
  let penalty = 0;

  if (distractionRatio > 0.5) {
    penalty = PENALTY_CONSTANTS.BAD_QUALITY_PENALTY;
  } else if (distractionRatio > 0.3) {
    penalty = PENALTY_CONSTANTS.POOR_QUALITY_PENALTY;
  }

  // Additional penalty for very low quality score
  if (overallScore < PENALTY_CONSTANTS.BAD_QUALITY_THRESHOLD) {
    penalty += PENALTY_CONSTANTS.BAD_QUALITY_PENALTY;
  } else if (overallScore < PENALTY_CONSTANTS.POOR_QUALITY_THRESHOLD) {
    penalty += PENALTY_CONSTANTS.POOR_QUALITY_PENALTY;
  }

  return penalty;
}

export function calculateAntiCheatPenalty(input: AntiCheatPenaltyInput): {
  total: number;
  violations: Array<{ type: AntiCheatViolationType; penalty: number }>;
  actionRequired: 'WARNING' | 'PENALTY' | 'DISQUALIFY' | 'BAN';
} {
  const basePenalties: Record<AntiCheatViolationType, number> = {
    TIME_MANIPULATION: PENALTY_CONSTANTS.TIME_MANIPULATION_PENALTY,
    DEVICE_CHANGE: PENALTY_CONSTANTS.DEVICE_CHANGE_PENALTY,
    RAPID_COMPLETION: PENALTY_CONSTANTS.RAPID_COMPLETION_PENALTY,
    SUSPICIOUS_PATTERN: PENALTY_CONSTANTS.SUSPICIOUS_PATTERN_PENALTY,
    IMPOSSIBLE_SCORE: PENALTY_CONSTANTS.TIME_MANIPULATION_PENALTY * 2,
  };

  const severityMultipliers: Record<string, number> = {
    LOW: 0.5,
    MEDIUM: 1,
    HIGH: 2,
    CRITICAL: 4,
  };

  let total = 0;
  const violations: Array<{ type: AntiCheatViolationType; penalty: number }> = [];
  let maxSeverity = 'LOW';

  for (const violation of input.violations) {
    const base = basePenalties[violation.type];
    const multiplier = severityMultipliers[violation.severity];
    const penalty = base * multiplier;

    total += penalty;
    violations.push({ type: violation.type, penalty });

    if (severityRankings[violation.severity] > severityRankings[maxSeverity]) {
      maxSeverity = violation.severity;
    }
  }

  const actionMap: Record<string, 'WARNING' | 'PENALTY' | 'DISQUALIFY' | 'BAN'> = {
    LOW: 'WARNING',
    MEDIUM: 'PENALTY',
    HIGH: 'DISQUALIFY',
    CRITICAL: 'BAN',
  };

  return {
    total,
    violations,
    actionRequired: actionMap[maxSeverity],
  };
}