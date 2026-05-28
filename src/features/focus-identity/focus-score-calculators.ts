import type { FocusScoreFactors, ScoreBand } from "./FocusIdentityEngine-types";
import { FOCUS_SCORE_CONFIG } from "./focus-score-config";
import {
  calculateConsistencyFactorForInput,
  calculateStreakStabilityFactorForInput,
} from "./habit-calculators";
import {
  calculateSessionQualityFactorForInput,
  calculateDiversityFactorForInput,
  calculateRecencyFactorForInput,
} from "./session-factors";

export interface CalculateScoreInput {
  sessionsLast30Days: number;
  targetSessionsPerWeek: number;
  missedDaysLast30Days: number;
  currentStreak: number;
  longestStreak: number;
  streakHistory: Array<{
    start: number;
    end: number | null;
    length: number;
  }>;
  sessionDetails: Array<{
    focusPurity: number;
    grade: string;
    duration: number;
    wasAbandoned: boolean;
    mode: string;
    startTime: string;
    context?: string;
  }>;
  daysSinceLastSession: number;
  last7DaySessions: number;
  last30DaySessions: number;
  scoreHistory: Array<{ date: string; score: number }>;
}

export interface CalculateScoreResult {
  score: number;
  factors: FocusScoreFactors;
}

export function calculateFocusScore(
  data: CalculateScoreInput,
): CalculateScoreResult {
  const factors: FocusScoreFactors = {
    consistency: calculateConsistencyFactorForInput(
      data.sessionsLast30Days,
      data.targetSessionsPerWeek,
      data.missedDaysLast30Days,
    ),
    streakStability: calculateStreakStabilityFactorForInput(
      data.currentStreak,
      data.longestStreak,
      data.streakHistory,
    ),
    sessionQuality: calculateSessionQualityFactorForInput(data.sessionDetails),
    diversity: calculateDiversityFactorForInput(
      data.sessionDetails.map((s) => ({
        mode: s.mode,
        hour: new Date(s.startTime).getHours(),
        dayOfWeek: new Date(s.startTime).getDay(),
        context: s.context,
      })),
    ),
    recency: calculateRecencyFactorForInput(
      data.daysSinceLastSession,
      data.last7DaySessions,
      data.last30DaySessions,
      data.scoreHistory,
    ),
  };

  const composite =
    factors.consistency.score *
      FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.CONSISTENCY +
    factors.streakStability.score *
      FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.STREAK_STABILITY +
    factors.sessionQuality.score *
      FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.SESSION_QUALITY +
    factors.diversity.score * FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.DIVERSITY +
    factors.recency.score * FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.RECENCY;

  const score =
    FOCUS_SCORE_CONFIG.MIN_SCORE +
    (composite / 100) *
      (FOCUS_SCORE_CONFIG.MAX_SCORE - FOCUS_SCORE_CONFIG.MIN_SCORE);

  return { score: Math.round(score), factors };
}

export function getScoreBand(score: number): ScoreBand {
  return (FOCUS_SCORE_CONFIG.BANDS.find(
    (band) => score >= band.min && score <= band.max,
  ) ??
    FOCUS_SCORE_CONFIG.BANDS[
      FOCUS_SCORE_CONFIG.BANDS.length - 1
    ]!) as ScoreBand;
}

export function calculateScoreChange(
  eventType: keyof typeof FOCUS_SCORE_CONFIG.SCORE_CHANGES,
  modifiers: {
    streakLength?: number;
    sessionGrade?: string;
    isInRecovery?: boolean;
  },
): number {
  const config = FOCUS_SCORE_CONFIG.SCORE_CHANGES[eventType];
  let change = config.base;

  if (modifiers.streakLength && change > 0) {
    change += Math.min(
      modifiers.streakLength * 0.5,
      config.max - config.base,
    );
  }

  if (modifiers.sessionGrade && change > 0) {
    const gradeBonus: Record<string, number> = {
      S: 10,
      A: 10,
      B: 2,
      C: 0,
      D: -2,
    };
    change += gradeBonus[modifiers.sessionGrade] ?? 0;
  }

  if (modifiers.isInRecovery && change > 0) {
    change *= FOCUS_SCORE_CONFIG.RECOVERY_BONUS_MULTIPLIER;
  }

  return Math.round(
    Math.min(config.max, Math.max(-Math.abs(config.max), change)),
  );
}
