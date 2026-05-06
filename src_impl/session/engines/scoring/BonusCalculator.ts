/**
 * Bonus Calculator
 *
 * Calculates all bonus types: time, streak, quality, interval, special.
 * Pure calculation logic.
 */

import type { FocusQualityMetrics, SessionState } from '../../types';

// ============================================================================
// Bonus Constants
// ============================================================================

export const BONUS_CONSTANTS = {
  // Time bonus thresholds
  EARLY_COMPLETION_THRESHOLD: 0.95, // 95% of time used (5% early)
  TIME_BONUS_MAX: 100,
  TIME_BONUS_PER_PERCENT_EARLY: 2,

  // Streak bonuses
  STREAK_BONUS_BASE: 10,
  STREAK_BONUS_PER_DAY: 5,
  STREAK_BONUS_MAX: 200,

  // Quality bonuses
  EXCELLENT_QUALITY_THRESHOLD: 90,
  GOOD_QUALITY_THRESHOLD: 75,
  AVERAGE_QUALITY_THRESHOLD: 50,
  EXCELLENT_QUALITY_BONUS: 150,
  GOOD_QUALITY_BONUS: 75,
  AVERAGE_QUALITY_BONUS: 25,

  // Interval bonuses
  MULTI_INTERVAL_BONUS: 50,
  POMODORO_COMPLETE_BONUS: 100,

  // Special bonuses
  PERFECT_SESSION_BONUS: 250, // No pauses, no interruptions, 100% completion
  MARATHON_BONUS: 100, // Sessions over 60 minutes
  EARLY_BIRD_BONUS: 50, // Before 8am
  NIGHT_OWL_BONUS: 50, // After 10pm
} as const;

// ============================================================================
// Time Bonus
// ============================================================================

export interface TimeBonusInput {
  plannedDuration: number;
  actualDuration: number;
  completionPercentage: number;
}

export function calculateTimeBonus(input: TimeBonusInput): number {
  const { plannedDuration, actualDuration, completionPercentage } = input;

  // Must be completed to get time bonus
  if (completionPercentage < 100) {return 0;}

  // Calculate how early (if at all)
  const timeRatio = actualDuration / plannedDuration;

  if (timeRatio > BONUS_CONSTANTS.EARLY_COMPLETION_THRESHOLD) {
    return 0; // Not early enough
  }

  const percentEarly = (1 - timeRatio) * 100;
  const bonus = Math.floor(percentEarly * BONUS_CONSTANTS.TIME_BONUS_PER_PERCENT_EARLY);

  return Math.min(bonus, BONUS_CONSTANTS.TIME_BONUS_MAX);
}

// ============================================================================
// Streak Bonus
// ============================================================================

export interface StreakBonusInput {
  currentStreak: number;
  basePoints: number;
}

export function calculateStreakBonus(input: StreakBonusInput): number {
  const { currentStreak, basePoints } = input;

  if (currentStreak <= 1) {
    return BONUS_CONSTANTS.STREAK_BONUS_BASE;
  }

  // Exponential growth with diminishing returns
  const streakMultiplier = Math.log(currentStreak) / Math.log(2);
  const bonus = Math.floor(BONUS_CONSTANTS.STREAK_BONUS_BASE * streakMultiplier);

  // Cap at max
  return Math.min(bonus, BONUS_CONSTANTS.STREAK_BONUS_MAX);
}

export function getStreakMultiplier(streakDays: number): number {
  const multipliers: Record<number, number> = {
    0: 1,
    1: 1,
    2: 1.1,
    3: 1.15,
    7: 1.25,
    14: 1.35,
    30: 1.5,
    60: 1.75,
    90: 2,
  };

  // Find closest streak milestone at or below current streak
  const milestones = Object.keys(multipliers).map(Number).sort((a, b) => b - a);
  for (const milestone of milestones) {
    if (streakDays >= milestone) {
      return multipliers[milestone];
    }
  }

  return 1;
}

// ============================================================================
// Quality Bonus
// ============================================================================

export interface QualityBonusInput {
  focusMetrics: FocusQualityMetrics;
  interruptions: number;
  pauses: number;
}

export function calculateQualityBonus(input: QualityBonusInput): number {
  const { focusMetrics, interruptions, pauses } = input;

  const overallScore = focusMetrics.overallScore;

  // Reduce quality score based on disruptions
  const disruptionPenalty = (interruptions * 5) + (pauses * 2);
  const adjustedScore = Math.max(0, overallScore - disruptionPenalty);

  if (adjustedScore >= BONUS_CONSTANTS.EXCELLENT_QUALITY_THRESHOLD) {
    return BONUS_CONSTANTS.EXCELLENT_QUALITY_BONUS;
  }

  if (adjustedScore >= BONUS_CONSTANTS.GOOD_QUALITY_THRESHOLD) {
    return BONUS_CONSTANTS.GOOD_QUALITY_BONUS;
  }

  if (adjustedScore >= BONUS_CONSTANTS.AVERAGE_QUALITY_THRESHOLD) {
    return BONUS_CONSTANTS.AVERAGE_QUALITY_BONUS;
  }

  return 0;
}

// ============================================================================
// Interval Bonus
// ============================================================================

export interface IntervalBonusInput {
  completedIntervals: number;
  totalIntervals: number;
  allIntervalsCompleted: boolean;
}

export function calculateIntervalBonus(input: IntervalBonusInput): number {
  const { completedIntervals, allIntervalsCompleted } = input;

  let bonus = 0;

  // Bonus for multiple intervals
  if (completedIntervals > 1) {
    bonus += completedIntervals * BONUS_CONSTANTS.MULTI_INTERVAL_BONUS;
  }

  // Big bonus for completing all intervals (pomodoro cycle)
  if (allIntervalsCompleted) {
    bonus += BONUS_CONSTANTS.POMODORO_COMPLETE_BONUS;
  }

  return bonus;
}

// ============================================================================
// Special Bonuses
// ============================================================================

export interface SpecialBonusInput {
  session: SessionState;
  startTime: number;
  endTime: number;
  noPauses: boolean;
  noInterruptions: boolean;
}

export interface SpecialBonusResult {
  perfectSession: boolean;
  marathon: boolean;
  earlyBird: boolean;
  nightOwl: boolean;
  totalBonus: number;
  badges: string[];
}

export function calculateSpecialBonuses(input: SpecialBonusInput): SpecialBonusResult {
  const { session, startTime, endTime, noPauses, noInterruptions } = input;

  const result: SpecialBonusResult = {
    perfectSession: false,
    marathon: false,
    earlyBird: false,
    nightOwl: false,
    totalBonus: 0,
    badges: [],
  };

  // Perfect session: 100% complete, no pauses, no interruptions
  if (session.completionPercentage >= 100 && noPauses && noInterruptions) {
    result.perfectSession = true;
    result.totalBonus += BONUS_CONSTANTS.PERFECT_SESSION_BONUS;
    result.badges.push('PERFECT_SESSION');
  }

  // Marathon: 60+ minutes
  const durationMinutes = (endTime - startTime) / 60000;
  if (durationMinutes >= 60) {
    result.marathon = true;
    result.totalBonus += BONUS_CONSTANTS.MARATHON_BONUS;
    result.badges.push('MARATHON');
  }

  // Time-based bonuses
  const startHour = new Date(startTime).getHours();

  if (startHour < 8) {
    result.earlyBird = true;
    result.totalBonus += BONUS_CONSTANTS.EARLY_BIRD_BONUS;
    result.badges.push('EARLY_BIRD');
  }

  if (startHour >= 22) {
    result.nightOwl = true;
    result.totalBonus += BONUS_CONSTANTS.NIGHT_OWL_BONUS;
    result.badges.push('NIGHT_OWL');
  }

  return result;
}

// ============================================================================
// Total Bonus Calculation
// ============================================================================

export interface TotalBonusInput {
  timeBonus: number;
  streakBonus: number;
  qualityBonus: number;
  intervalBonus: number;
  specialBonus: number;
}

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

// ============================================================================
// Export
// ============================================================================

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
