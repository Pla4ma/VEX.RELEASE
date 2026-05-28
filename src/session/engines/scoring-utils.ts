import type { ScoreCalculation } from "../types";

const MIN_COMPLETION_FOR_CREDIT = 0.5;

export function calculateFinalScore(calc: ScoreCalculation): number {
  const base =
    calc.basePoints *
    calc.timeMultiplier *
    calc.streakMultiplier *
    calc.qualityMultiplier;
  return Math.max(
    0,
    Math.round(base * calc.penaltyMultiplier + calc.bonusPoints),
  );
}

export function isEligibleForRewards(completionPercentage: number): boolean {
  return completionPercentage >= MIN_COMPLETION_FOR_CREDIT * 100;
}

export function getCompletionTier(
  completionPercentage: number,
): "NONE" | "PARTIAL" | "FULL" | "PERFECT" {
  if (completionPercentage >= 100) return "PERFECT";
  if (completionPercentage >= 90) return "FULL";
  if (completionPercentage >= MIN_COMPLETION_FOR_CREDIT * 100)
    return "PARTIAL";
  return "NONE";
}

export function serializeCalculation(
  calculation: ScoreCalculation,
): Record<string, number> {
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
