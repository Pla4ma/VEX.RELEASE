import { FOCUS_SCORE_CONFIG, IDENTITY_STATEMENTS } from './focus-score-config';
import type { FocusIdentityProfile, ScoreBand } from './FocusIdentityEngine';

export const createInitialFocusIdentityProfile = (
  userId: string,
  band: ScoreBand,
): FocusIdentityProfile => {
  const now = new Date();
  const today = now.toISOString().split('T')[0]!;

  return {
    userId,
    currentScore: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
    previousScore: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
    scoreHistory: [
      {
        date: today,
        score: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
        reason: 'Initial score',
      },
    ],
    percentileRank: 50,
    band,
    factors: {
      consistency: {
        score: 55,
        sessionsLast30Days: 0,
        targetSessionsPerWeek: 4,
        actualConsistency: 0,
        missedDaysLast30Days: 0,
      },
      streakStability: {
        score: 50,
        currentStreak: 0,
        longestStreak: 0,
        averageStreakLength: 0,
        totalStreaksStarted: 0,
        streakBreakFrequency: 0,
      },
      sessionQuality: {
        score: 50,
        averageFocusPurity: 0,
        averageGrade: 'D',
        perfectSessionsCount: 0,
        averageSessionDuration: 0,
      },
      diversity: {
        score: 0,
        uniqueSessionModes: 0,
        uniqueTimeSlots: 0,
        uniqueDaysOfWeek: 0,
        weekendSessions: 0,
        contextVariety: 0,
      },
      recency: {
        score: 50,
        daysSinceLastSession: 999,
        last7DayActivity: 0,
        last30DayActivity: 0,
        trendDirection: 'STABLE',
        velocity: 0,
      },
    },
    identityStatement: IDENTITY_STATEMENTS.Building[0]!,
    streakInCurrentBand: 0,
    totalScoreCalculations: 1,
    firstScoreDate: today,
    isInRecovery: false,
    recoveryStartDate: null,
    recoveryProgress: 0,
    preLapseScore: null,
    topStrength: 'consistency',
    topWeakness: 'recency',
    recommendedActions: [
      'Complete your first session to activate your Focus Score',
      'Set a weekly goal of 3-4 sessions to build consistency',
      'Try different session modes to improve diversity',
    ],
    monthlyReport: null,
    updatedAt: Date.now(),
  };
};
