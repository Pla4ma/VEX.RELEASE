import type { FocusQualityMetrics } from "../../types";


export function calculateAbandonPenalty(input: AbandonPenaltyInput): AbandonPenaltyResult {
  const { progressPercentage, streakAtRisk, hasStreakSave } = input;

  let scorePenalty = 0;

  // Base penalty
  scorePenalty += PENALTY_CONSTANTS.ABANDON_BASE_PENALTY;

  // Progress factor (higher progress = higher penalty for abandoning)
  const progressFactor = Math.pow(progressPercentage / 100, 2) * 100;
  scorePenalty += progressFactor;

  // Streak risk multiplier
  if (streakAtRisk && !hasStreakSave) {
    scorePenalty *= PENALTY_CONSTANTS.ABANDON_STREAK_RISK_MULTIPLIER;
  }

  // Calculate partial credit
  const partialCredit = progressPercentage >= 50;
  const creditPercentage = partialCredit ? progressPercentage * PENALTY_CONSTANTS.ABANDON_PROGRESS_FACTOR : 0;

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
  const { pausePenalty, interruptionPenalty, qualityPenalty, antiCheatPenalty, baseScore } = input;

  const rawTotal = pausePenalty + interruptionPenalty + qualityPenalty + antiCheatPenalty;

  // Cap penalties at maximum percentage of base score
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