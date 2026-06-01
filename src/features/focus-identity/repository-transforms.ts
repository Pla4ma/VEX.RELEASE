import type { z } from 'zod';
import { launchColors } from '@theme/tokens/launch-colors';
import type {
  FocusIdentityProfile,
  FocusScoreFactors,
} from './FocusIdentityEngine';
import type { FocusProfileRowSchema } from './repository-helpers';

export function transformRowToProfile(
  row: z.infer<typeof FocusProfileRowSchema>,
): FocusIdentityProfile {
  return {
    userId: row.user_id,
    currentScore: row.current_score,
    previousScore: row.previous_score,
    scoreHistory: [],
    percentileRank: row.percentile_rank,
    band: {
      min:
        row.current_score >= 800
          ? 800
          : row.current_score >= 740
            ? 740
            : row.current_score >= 670
              ? 670
              : row.current_score >= 580
                ? 580
                : row.current_score >= 500
                  ? 500
                  : row.current_score >= 420
                    ? 420
                    : 300,
      max:
        row.current_score >= 800
          ? 850
          : row.current_score >= 740
            ? 799
            : row.current_score >= 670
              ? 739
              : row.current_score >= 580
                ? 669
                : row.current_score >= 500
                  ? 579
                  : row.current_score >= 420
                    ? 499
                    : 419,
      label: row.band_label,
      title: row.band_title,
      color: launchColors.hex_4caf50,
      percentile: row.percentile_rank,
    },
    factors: {
      consistency: {
        score: 50,
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
    identityStatement: row.identity_statement,
    streakInCurrentBand: row.streak_in_current_band,
    totalScoreCalculations: row.total_calculations,
    firstScoreDate: row.first_score_date,
    isInRecovery: row.is_in_recovery,
    recoveryStartDate: row.recovery_start_date,
    recoveryProgress: row.recovery_progress,
    preLapseScore: row.pre_lapse_score,
    // Cast validated at Zod boundary — DB stores factor keys as plain strings
    topStrength: row.top_strength as keyof FocusScoreFactors,
    topWeakness: row.top_weakness as keyof FocusScoreFactors,
    recommendedActions: row.recommended_actions,
    monthlyReport: null,
    updatedAt: new Date(row.updated_at).getTime(),
  };
}
