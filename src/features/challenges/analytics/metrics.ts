/**
 * Challenge Analytics - Metrics Calculation
 *
 * Metrics calculation functions for challenge performance analysis.
 */

import type { Challenge, UserChallenge } from '../types';

/**
 * Calculate challenge engagement metrics
 */
export function calculateChallengeMetrics(
  userChallenges: UserChallenge[],
  challenges: Challenge[],
): {
  totalIssued: number;
  completionRate: number;
  averageTimeToComplete: number;
  claimRate: number;
  rerollRate: number;
  expirationRate: number;
} {
  const totalIssued = userChallenges.length;
  const completed = userChallenges.filter(
    (uc) => uc.status === 'COMPLETED' || uc.status === 'CLAIMED',
  ).length;
  const claimed = userChallenges.filter((uc) => uc.status === 'CLAIMED').length;
  const expired = userChallenges.filter((uc) => uc.status === 'EXPIRED').length;
  const rerolled = userChallenges.filter((uc) => uc.rerollCount > 0).length;

  // Calculate average time to complete
  const completedWithTime = userChallenges.filter(
    (uc) =>
      uc.status === 'COMPLETED' ||
      (uc.status === 'CLAIMED' && uc.completedAt && uc.assignedAt),
  );

  const averageTimeToComplete =
    completedWithTime.length > 0
      ? completedWithTime.reduce((sum, uc) => {
          const completedAt = uc.completedAt || uc.claimedAt || 0;
          return sum + (completedAt - uc.assignedAt);
        }, 0) / completedWithTime.length
      : 0;

  return {
    totalIssued,
    completionRate: totalIssued > 0 ? completed / totalIssued : 0,
    averageTimeToComplete,
    claimRate: completed > 0 ? claimed / completed : 0,
    rerollRate: totalIssued > 0 ? rerolled / totalIssued : 0,
    expirationRate: totalIssued > 0 ? expired / totalIssued : 0,
  };
}

/**
 * Calculate challenge difficulty metrics
 */
export function calculateDifficultyMetrics(
  userChallenges: UserChallenge[],
  challenges: Challenge[],
): {
  easy: { completionRate: number; averageTime: number };
  medium: { completionRate: number; averageTime: number };
  hard: { completionRate: number; averageTime: number };
} {
  const byDifficulty = (difficulty: string) => {
    const filtered = userChallenges.filter((uc) => {
      const challenge = challenges.find((c) => c.id === uc.challengeId);
      return challenge?.difficulty === difficulty;
    });

    const completed = filtered.filter(
      (uc) => uc.status === 'COMPLETED' || uc.status === 'CLAIMED',
    ).length;

    const completedWithTime = filtered.filter(
      (uc) =>
        (uc.status === 'COMPLETED' || uc.status === 'CLAIMED') &&
        uc.completedAt &&
        uc.assignedAt,
    );

    const averageTime =
      completedWithTime.length > 0
        ? completedWithTime.reduce(
            (sum, uc) => sum + (uc.completedAt! - uc.assignedAt),
            0,
          ) / completedWithTime.length
        : 0;

    return {
      completionRate: filtered.length > 0 ? completed / filtered.length : 0,
      averageTime,
    };
  };

  return {
    easy: byDifficulty('EASY'),
    medium: byDifficulty('MEDIUM'),
    hard: byDifficulty('HARD'),
  };
}
