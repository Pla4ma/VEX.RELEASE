import { BONUS_CONSTANTS, STREAK_MULTIPLIERS } from "./bonus-constants";
import type {
  TimeBonusInput,
  StreakBonusInput,
  QualityBonusInput,
  IntervalBonusInput,
  SpecialBonusInput,
  SpecialBonusResult,
  TotalBonusInput,
} from "./bonus-types";

export { BONUS_CONSTANTS, STREAK_MULTIPLIERS } from "./bonus-constants";
export type {
  TimeBonusInput,
  StreakBonusInput,
  QualityBonusInput,
  IntervalBonusInput,
  SpecialBonusInput,
  SpecialBonusResult,
  TotalBonusInput,
} from "./bonus-types";

export function calculateTimeBonus(input: TimeBonusInput): number {
  const { plannedDuration, actualDuration, completionPercentage } = input;
  if (completionPercentage < 100) return 0;
  const timeRatio = actualDuration / plannedDuration;
  if (timeRatio > BONUS_CONSTANTS.EARLY_COMPLETION_THRESHOLD) return 0;
  const percentEarly = (1 - timeRatio) * 100;
  const bonus = Math.floor(
    percentEarly * BONUS_CONSTANTS.TIME_BONUS_PER_PERCENT_EARLY,
  );
  return Math.min(bonus, BONUS_CONSTANTS.TIME_BONUS_MAX);
}

export function calculateStreakBonus(input: StreakBonusInput): number {
  const { currentStreak } = input;
  if (currentStreak <= 1) return BONUS_CONSTANTS.STREAK_BONUS_BASE;
  const streakMultiplier = Math.log(currentStreak) / Math.log(2);
  const bonus = Math.floor(
    BONUS_CONSTANTS.STREAK_BONUS_BASE * streakMultiplier,
  );
  return Math.min(bonus, BONUS_CONSTANTS.STREAK_BONUS_MAX);
}

export function getStreakMultiplier(streakDays: number): number {
  const milestones = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a);
  for (const milestone of milestones) {
    if (streakDays >= milestone) {
      const value = STREAK_MULTIPLIERS[milestone];
      if (value !== undefined) return value;
    }
  }
  return 1;
}

export function calculateQualityBonus(input: QualityBonusInput): number {
  const { focusMetrics, interruptions, pauses } = input;
  const adjustedScore = Math.max(
    0,
    focusMetrics.overallScore - (interruptions * 5 + pauses * 2),
  );
  if (adjustedScore >= BONUS_CONSTANTS.EXCELLENT_QUALITY_THRESHOLD)
    return BONUS_CONSTANTS.EXCELLENT_QUALITY_BONUS;
  if (adjustedScore >= BONUS_CONSTANTS.GOOD_QUALITY_THRESHOLD)
    return BONUS_CONSTANTS.GOOD_QUALITY_BONUS;
  if (adjustedScore >= BONUS_CONSTANTS.AVERAGE_QUALITY_THRESHOLD)
    return BONUS_CONSTANTS.AVERAGE_QUALITY_BONUS;
  return 0;
}

export function calculateIntervalBonus(input: IntervalBonusInput): number {
  const { completedIntervals, allIntervalsCompleted } = input;
  let bonus = 0;
  if (completedIntervals > 1)
    bonus += completedIntervals * BONUS_CONSTANTS.MULTI_INTERVAL_BONUS;
  if (allIntervalsCompleted) bonus += BONUS_CONSTANTS.POMODORO_COMPLETE_BONUS;
  return bonus;
}

export function calculateSpecialBonuses(
  input: SpecialBonusInput,
): SpecialBonusResult {
  const { session, startTime, endTime, noPauses, noInterruptions } = input;
  const result: SpecialBonusResult = {
    perfectSession: false,
    marathon: false,
    earlyBird: false,
    nightOwl: false,
    totalBonus: 0,
    badges: [],
  };
  if (session.completionPercentage >= 100 && noPauses && noInterruptions) {
    result.perfectSession = true;
    result.totalBonus += BONUS_CONSTANTS.PERFECT_SESSION_BONUS;
    result.badges.push("PERFECT_SESSION");
  }
  const durationMinutes = (endTime - startTime) / 60000;
  if (durationMinutes >= 60) {
    result.marathon = true;
    result.totalBonus += BONUS_CONSTANTS.MARATHON_BONUS;
    result.badges.push("MARATHON");
  }
  const startHour = new Date(startTime).getHours();
  if (startHour < 8) {
    result.earlyBird = true;
    result.totalBonus += BONUS_CONSTANTS.EARLY_BIRD_BONUS;
    result.badges.push("EARLY_BIRD");
  }
  if (startHour >= 22) {
    result.nightOwl = true;
    result.totalBonus += BONUS_CONSTANTS.NIGHT_OWL_BONUS;
    result.badges.push("NIGHT_OWL");
  }
  return result;
}

export function calculateTotalBonus(input: TotalBonusInput): {
  total: number;
  breakdown: Record<string, number>;
} {
  const total =
    input.timeBonus +
    input.streakBonus +
    input.qualityBonus +
    input.intervalBonus +
    input.specialBonus;
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

export default BonusCalculator;
