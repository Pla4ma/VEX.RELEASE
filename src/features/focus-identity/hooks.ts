/**
 * Focus Identity Hooks
 *
 * Centralized hooks for focus identity functionality
 */

import { useMemo } from 'react';
import { useFocusScore } from './hooks-focus-score';
import {
  FocusIdentityEngine,
  type ScoreBand,
  type FocusIdentityProfile,
} from './FocusIdentityEngine';

export { useFocusScoreColor, useIdentityStatement } from './hooks-display';

/**
 * Hook for accessing focus identity data and state
 */
export function useFocusIdentity(userId: string) {
  const { score, history, status, error, refetch } = useFocusScore();

  const engine = useMemo(() => new FocusIdentityEngine(), []);

  // Transform the data to match the expected interface
  const profile: FocusIdentityProfile | null = useMemo(() => {
    if (!score) {
      return null;
    }

    const band = engine.getScoreBand(score.currentScore);

    return {
      userId: score.userId,
      currentScore: score.currentScore,
      previousScore: score.previousScore,
      scoreHistory: [],
      percentileRank: band.percentile,
      band,
      factors: {
        consistency: {
          score: score.factors.consistency.score,
          sessionsLast30Days: 0,
          targetSessionsPerWeek: 4,
          actualConsistency: 0,
          missedDaysLast30Days: 0,
        },
        streakStability: {
          score: score.factors.streakStability.score,
          currentStreak: 0,
          longestStreak: 0,
          averageStreakLength: 0,
          totalStreaksStarted: 0,
          streakBreakFrequency: 0,
        },
        sessionQuality: {
          score: score.factors.sessionQuality.score,
          averageFocusPurity: 0,
          averageGrade: 'D',
          perfectSessionsCount: 0,
          averageSessionDuration: 0,
        },
        diversity: {
          score: score.factors.intentionalDifficulty.score,
          uniqueSessionModes: 0,
          uniqueTimeSlots: 0,
          uniqueDaysOfWeek: 0,
          weekendSessions: 0,
          contextVariety: 0,
        },
        recency: {
          score: score.factors.recency.score,
          daysSinceLastSession: 0,
          last7DayActivity: 0,
          last30DayActivity: 0,
          trendDirection: 'STABLE',
          velocity: 0,
        },
      },
      identityStatement: engine.getIdentityStatement(band.label, 0),
      streakInCurrentBand: 0,
      totalScoreCalculations: 0,
      firstScoreDate: score.createdAt,
      isInRecovery: false,
      recoveryStartDate: null,
      recoveryProgress: 0,
      preLapseScore: null,
      topStrength: 'consistency',
      topWeakness: 'recency',
      recommendedActions: [],
      monthlyReport: null,
      updatedAt: Date.now(),
    };
  }, [score, engine]);

  const currentBand: ScoreBand | null = useMemo(() => {
    if (!profile) {
      return null;
    }
    return engine.getScoreBand(profile.currentScore);
  }, [profile, engine]);

  const scoreChange = useMemo(() => {
    if (!history || history.length < 2) {
      return 0;
    }
    const latest = history[history.length - 1]!;
    const previous = history[history.length - 2]!;
    return latest.score - previous.score;
  }, [history]);

  const loadingState = status;
  const isRetrying = status === 'pending' && !!score;

  return {
    profile,
    loadingState,
    error,
    isRetrying,
    retry: () => void refetch(),
    currentBand,
    scoreChange,
  };
}

/**
 * Hook for monthly focus report data
 */
export function useMonthlyReport(userId: string, year: number, month: number) {
  // Import from the new monthly report system
  const {
    useMonthlyReport: useMonthlyReportImpl,
  } = require('./monthly-report');
  return useMonthlyReportImpl(userId, year, month);
}
