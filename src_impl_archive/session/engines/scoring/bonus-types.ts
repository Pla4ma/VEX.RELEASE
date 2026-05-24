import type { FocusQualityMetrics, SessionState } from '../../types';

export interface TimeBonusInput {
  plannedDuration: number;
  actualDuration: number;
  completionPercentage: number;
}

export interface StreakBonusInput {
  currentStreak: number;
  basePoints: number;
}

export interface QualityBonusInput {
  focusMetrics: FocusQualityMetrics;
  interruptions: number;
  pauses: number;
}

export interface IntervalBonusInput {
  completedIntervals: number;
  totalIntervals: number;
  allIntervalsCompleted: boolean;
}

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

export interface TotalBonusInput {
  timeBonus: number;
  streakBonus: number;
  qualityBonus: number;
  intervalBonus: number;
  specialBonus: number;
}
