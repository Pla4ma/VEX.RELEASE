import type { FocusQualityMetrics, SessionState } from "../../types";


export function calculateTotalBonus(input: TotalBonusInput): { total: number; breakdown: Record<string, number> } {
  const total = input.timeBonus + input.streakBonus + input.qualityBonus + input.intervalBonus + input.specialBonus;

  return {
    total,
    breakdown: {
      time: input.timeBonus,
      streak: input.streakBonus,
      quality: input.qualityBonus,
      interval: input.intervalBonus,
      special: input.specialBonus,
    },
  };
}

export const BonusCalculator = {
  calculateTimeBonus,
  calculateStreakBonus,
  getStreakMultiplier,
  calculateQualityBonus,
  calculateIntervalBonus,
  calculateSpecialBonuses,
  calculateTotalBonus,
  constants: BONUS_CONSTANTS,
};