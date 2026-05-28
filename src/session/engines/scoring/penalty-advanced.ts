import { PENALTY_CONSTANTS, severityRankings } from "./penalty-constants";
import type {
  AntiCheatViolationType,
  AntiCheatPenaltyInput,
  AbandonPenaltyInput,
  AbandonPenaltyResult,
  TotalPenaltyInput,
  PenaltyAction,
  AntiCheatPenaltyResult,
  TotalPenaltyResult,
} from "./penalty-types";

export function calculateAntiCheatPenalty(
  input: AntiCheatPenaltyInput,
): AntiCheatPenaltyResult {
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
  const actionMap: Record<string, PenaltyAction> = {
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

export function calculateTotalPenalty(
  input: TotalPenaltyInput,
): TotalPenaltyResult {
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
