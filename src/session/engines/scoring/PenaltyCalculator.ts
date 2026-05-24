import type { FocusQualityMetrics } from "../../types";
import { PENALTY_CONSTANTS, severityRankings } from "./penalty-constants";
import type {
  PausePenaltyInput,
  InterruptionSeverity,
  InterruptionPenaltyInput,
  QualityPenaltyInput,
  AntiCheatViolationType,
  AntiCheatPenaltyInput,
  AbandonPenaltyInput,
  AbandonPenaltyResult,
  TotalPenaltyInput,
} from "./penalty-types";

export { PENALTY_CONSTANTS, severityRankings } from "./penalty-constants";

export type {
  PausePenaltyInput,
  InterruptionSeverity,
  InterruptionPenaltyInput,
  QualityPenaltyInput,
  AntiCheatViolationType,
  AntiCheatPenaltyInput,
  AbandonPenaltyInput,
  AbandonPenaltyResult,
  TotalPenaltyInput,
} from "./penalty-types";

export function calculatePausePenalty(input: PausePenaltyInput): number {
  const { pauseCount, totalPauseDurationSeconds } = input;
  if (pauseCount === 0) return 0;
  const basePenalty = pauseCount * PENALTY_CONSTANTS.PAUSE_PENALTY_BASE;
  const pauseMinutes = totalPauseDurationSeconds / 60;
  const durationPenalty =
    pauseMinutes * PENALTY_CONSTANTS.PAUSE_PENALTY_PER_MINUTE;
  const total = basePenalty + durationPenalty;
  return Math.min(total, PENALTY_CONSTANTS.PAUSE_PENALTY_MAX);
}

export function calculateInterruptionPenalty(input: InterruptionPenaltyInput): {
  total: number;
  breakdown: Record<InterruptionSeverity, number>;
} {
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
  if (timeLostSeconds > 300) return "CRITICAL";
  if (timeLostSeconds > 120) return "MAJOR";
  if (timeLostSeconds > 30) return "MODERATE";
  return "MINOR";
}

export function calculateQualityPenalty(input: QualityPenaltyInput): number {
  const { focusMetrics, distractionTime, totalSessionTime } = input;
  if (totalSessionTime === 0) return 0;
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

export function calculateAntiCheatPenalty(input: AntiCheatPenaltyInput): {
  total: number;
  violations: Array<{ type: AntiCheatViolationType; penalty: number }>;
  actionRequired: "WARNING" | "PENALTY" | "DISQUALIFY" | "BAN";
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
  const violations: Array<{ type: AntiCheatViolationType; penalty: number }> =
    [];
  let maxSeverity: string = "LOW";
  for (const violation of input.violations) {
    const base = basePenalties[violation.type];
    const multiplier = severityMultipliers[violation.severity];
    if (multiplier === undefined) continue;
    const penalty = base * multiplier;
    total += penalty;
    violations.push({ type: violation.type, penalty });
    const currentRank = severityRankings[violation.severity];
    const maxRank = severityRankings[maxSeverity];
    if (
      currentRank !== undefined &&
      maxRank !== undefined &&
      currentRank > maxRank
    ) {
      maxSeverity = violation.severity;
    }
  }
  const actionMap: Record<
    string,
    "WARNING" | "PENALTY" | "DISQUALIFY" | "BAN"
  > = {
    LOW: "WARNING",
    MEDIUM: "PENALTY",
    HIGH: "DISQUALIFY",
    CRITICAL: "BAN",
  };
  const actionRequired = actionMap[maxSeverity];
  return { total, violations, actionRequired: actionRequired ?? "WARNING" };
}

export function calculateAbandonPenalty(
  input: AbandonPenaltyInput,
): AbandonPenaltyResult {
  const { progressPercentage, streakAtRisk, hasStreakSave } = input;
  let scorePenalty = 0;
  scorePenalty += PENALTY_CONSTANTS.ABANDON_BASE_PENALTY;
  const progressFactor = Math.pow(progressPercentage / 100, 2) * 100;
  scorePenalty += progressFactor;
  if (streakAtRisk && !hasStreakSave) {
    scorePenalty *= PENALTY_CONSTANTS.ABANDON_STREAK_RISK_MULTIPLIER;
  }
  const partialCredit = progressPercentage >= 50;
  const creditPercentage = partialCredit
    ? progressPercentage * PENALTY_CONSTANTS.ABANDON_PROGRESS_FACTOR
    : 0;
  return {
    totalPenalty: scorePenalty,
    scorePenalty,
    streakPreserved: hasStreakSave,
    partialCredit,
    creditPercentage,
  };
}

export function calculateTotalPenalty(input: TotalPenaltyInput): {
  total: number;
  capped: boolean;
  percentage: number;
  breakdown: Record<string, number>;
} {
  const {
    pausePenalty,
    interruptionPenalty,
    qualityPenalty,
    antiCheatPenalty,
    baseScore,
  } = input;
  const rawTotal =
    pausePenalty + interruptionPenalty + qualityPenalty + antiCheatPenalty;
  const maxPenalty = baseScore * PENALTY_CONSTANTS.MAX_TOTAL_PENALTY_PERCENTAGE;
  const total = Math.min(rawTotal, maxPenalty);
  const capped = rawTotal > maxPenalty;
  const percentage = baseScore > 0 ? (total / baseScore) * 100 : 0;
  return {
    total,
    capped,
    percentage,
    breakdown: {
      pause: pausePenalty,
      interruption: interruptionPenalty,
      quality: qualityPenalty,
      antiCheat: antiCheatPenalty,
    },
  };
}

export const PenaltyCalculator = {
  calculatePausePenalty,
  calculateInterruptionPenalty,
  getSeverityFromTimeLost,
  calculateQualityPenalty,
  calculateAntiCheatPenalty,
  calculateAbandonPenalty,
  calculateTotalPenalty,
  constants: PENALTY_CONSTANTS,
};

export default PenaltyCalculator;
