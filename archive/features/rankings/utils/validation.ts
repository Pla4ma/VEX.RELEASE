/**
 * Rankings Validation Utilities
 *
 * Leaderboard integrity checks, score validation, anti-cheese detection.
 *
 * @phase 10 - Deepening: Leaderboard integrity
 */

import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';

const debug = createDebugger('rankings:validation');

// ============================================================================
// Schemas
// ============================================================================

export const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  score: z.number().min(0),
  rank: z.number().min(1),
  timestamp: z.number(),
  sessionCount: z.number().min(0),
  avgSessionQuality: z.number().min(0).max(100),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// ============================================================================
// Score Validation
// ============================================================================

export interface ScoreValidationResult {
  valid: boolean;
  errors: string[];
  manipulationRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedLegitimateScore?: number;
}

/**
 * Validate leaderboard score submission
 */
export function validateScoreSubmission(
  submission: {
    userId: string;
    score: number;
    previousScore: number;
    sessionData: { duration: number; quality: number; timestamp: number }[];
  },
  globalStats: {
    averageScore: number;
    topScore: number;
    medianSessionQuality: number;
  }
): ScoreValidationResult {
  const result: ScoreValidationResult = {
    valid: true,
    errors: [],
    manipulationRisk: 'NONE',
  };

  // Check 1: Score decrease (impossible)
  if (submission.score < submission.previousScore) {
    result.errors.push('Score cannot decrease');
    result.valid = false;
    result.manipulationRisk = 'HIGH';
    return result;
  }

  // Check 2: Impossible score jump
  const scoreIncrease = submission.score - submission.previousScore;
  const MAX_JUMP = 10000; // Max reasonable jump
  if (scoreIncrease > MAX_JUMP) {
    result.errors.push(`Suspicious score jump: +${scoreIncrease}`);
    result.manipulationRisk = 'HIGH';
  }

  // Check 3: Session quality correlation
  const avgQuality = submission.sessionData.length > 0
    ? submission.sessionData.reduce((sum, s) => sum + s.quality, 0) / submission.sessionData.length
    : 0;

  if (avgQuality < 30 && scoreIncrease > 1000) {
    result.errors.push('High score with poor session quality');
    result.manipulationRisk = 'MEDIUM';
  }

  // Check 4: Session duration correlation
  const totalDuration = submission.sessionData.reduce((sum, s) => sum + s.duration, 0);
  const expectedScorePerHour = 2000; // Expected XP per hour
  const hours = totalDuration / (60 * 60 * 1000);
  const expectedScore = hours * expectedScorePerHour;
  const deviation = scoreIncrease / Math.max(expectedScore, 1);

  if (deviation > 5) {
    result.errors.push(`Score deviation too high (${deviation.toFixed(1)}x expected)`);
    result.manipulationRisk = 'MEDIUM';
    result.estimatedLegitimateScore = Math.round(submission.previousScore + expectedScore);
  }

  // Check 5: Comparison to global stats
  if (submission.score > globalStats.topScore * 1.5) {
    result.errors.push('Score exceeds global top score by 50%+');
    result.manipulationRisk = 'HIGH';
  }

  // Check 6: Rapid submission
  const recentSessions = submission.sessionData.filter(
    s => Date.now() - s.timestamp < 24 * 60 * 60 * 1000
  );
  if (recentSessions.length > 20) {
    result.errors.push('Excessive sessions in 24h (grinding detection)');
    result.manipulationRisk = 'LOW';
  }

  if (result.manipulationRisk !== 'NONE') {
    eventBus.publish('analytics:track', {
      event: 'leaderboard_score_flagged',
      properties: {
        userId: submission.userId,
        risk: result.manipulationRisk,
        scoreIncrease,
        deviation,
      },
    });
  }

  return result;
}

// ============================================================================
// Leaderboard Integrity
// ============================================================================

export interface IntegrityCheckResult {
  clean: boolean;
  anomalies: Anomaly[];
  recommendedActions: string[];
}

export interface Anomaly {
  type: 'SCORE_SPIKE' | 'SESSION_QUALITY_MISMATCH' | 'TIMING_ANOMALY' | 'STATISTICAL_OUTLIER';
  userId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
}

/**
 * Check leaderboard integrity across all entries
 */
export function checkLeaderboardIntegrity(
  entries: LeaderboardEntry[],
  timeframe: 'DAILY' | 'WEEKLY' | 'SEASONAL'
): IntegrityCheckResult {
  const anomalies: Anomaly[] = [];
  const recommendedActions: string[] = [];

  // Statistical analysis
  const scores = entries.map(e => e.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const stdDev = Math.sqrt(
    scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length
  );

  // Check for statistical outliers
  entries.forEach(entry => {
    const zScore = (entry.score - avg) / stdDev;

    if (zScore > 3) {
      anomalies.push({
        type: 'STATISTICAL_OUTLIER',
        userId: entry.userId,
        severity: 'HIGH',
        details: `Z-score: ${zScore.toFixed(2)}`,
      });
    }

    // Check session quality correlation
    if (entry.avgSessionQuality < 40 && entry.score > avg * 2) {
      anomalies.push({
        type: 'SESSION_QUALITY_MISMATCH',
        userId: entry.userId,
        severity: 'MEDIUM',
        details: `Low quality (${entry.avgSessionQuality}%) with high score`,
      });
    }
  });

  // Generate recommendations
  const highRiskUsers = anomalies.filter(a => a.severity === 'HIGH').length;
  if (highRiskUsers > 5) {
    recommendedActions.push(`Review ${highRiskUsers} high-risk accounts`);
  }

  if (anomalies.some(a => a.type === 'TIMING_ANOMALY')) {
    recommendedActions.push('Enable enhanced timing validation');
  }

  return {
    clean: anomalies.length === 0,
    anomalies,
    recommendedActions,
  };
}

// ============================================================================
// Rank Protection
// ============================================================================

/**
 * Validate rank change (prevent rank skipping)
 */
export function validateRankChange(
  previousRank: number,
  newRank: number,
  userHistory: { highestRank: number; rankChanges: number }
): { valid: boolean; error?: string } {
  // Cannot skip more than 10 ranks at once
  const rankJump = previousRank - newRank;
  if (rankJump > 10) {
    return {
      valid: false,
      error: `Invalid rank jump: ${rankJump} ranks`,
    };
  }

  // Cannot lose rank if already achieved
  if (newRank > previousRank && userHistory.highestRank <= previousRank) {
    // This is actually valid - you can lose rank
    return { valid: true };
  }

  // Too many rank changes in short period
  if (userHistory.rankChanges > 20) {
    return {
      valid: false,
      error: 'Too many rank changes (possible manipulation)',
    };
  }

  return { valid: true };
}

// ============================================================================
// Export
// ============================================================================

export const RankingsValidation = {
  validateScoreSubmission,
  checkLeaderboardIntegrity,
  validateRankChange,
  LeaderboardEntrySchema,
};

export default RankingsValidation;
