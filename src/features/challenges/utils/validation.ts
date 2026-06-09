import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';
const _debug = createDebugger('challenges:validation');
export const ChallengeDifficultySchema = z.enum([
  'EASY',
  'MEDIUM',
  'HARD',
  'EXPERT',
]);
export type ChallengeDifficulty = z.infer<typeof ChallengeDifficultySchema>;
export const ChallengeCompletionSchema = z.object({
  challengeId: z.string(),
  userId: z.string(),
  completedAt: z.number(),
  timeSpent: z.number().min(0),
  attempts: z.number().min(1),
  score: z.number().min(0),
});
export type ChallengeCompletion = z.infer<typeof ChallengeCompletionSchema>;
export interface CompletionValidationResult {
  valid: boolean;
  errors: string[];
  suspicious: boolean;
  estimatedLegitimateTime?: number;
}
export function validateChallengeCompletion(
  completion: ChallengeCompletion,
  challenge: {
    id: string;
    difficulty: ChallengeDifficulty;
    expectedDuration: number;
    minDuration: number;
    maxDuration: number;
  },
  userHistory: {
    previousCompletions: ChallengeCompletion[];
    avgTimeForDifficulty: number;
  },
): CompletionValidationResult {
  const result: CompletionValidationResult = {
    valid: true,
    errors: [],
    suspicious: false,
  };
  if (completion.timeSpent < challenge.minDuration) {
    result.errors.push(
      `Completed too fast: ${completion.timeSpent}s (min: ${challenge.minDuration}s)`,
    );
    result.suspicious = true;
  }
  if (completion.timeSpent > challenge.maxDuration) {
    result.errors.push(
      `Exceeded time limit: ${completion.timeSpent}s (max: ${challenge.maxDuration}s)`,
    );
    result.valid = false;
  }
  const MAX_ATTEMPTS = 100;
  if (completion.attempts > MAX_ATTEMPTS) {
    result.errors.push(`Excessive attempts: ${completion.attempts}`);
    result.suspicious = true;
  }
  const speedRatio =
    challenge.expectedDuration / Math.max(completion.timeSpent, 1);
  if (speedRatio > 5) {
    result.errors.push(
      `Suspiciously fast completion (${speedRatio.toFixed(1)}x expected speed)`,
    );
    result.suspicious = true;
  }
  if (userHistory.avgTimeForDifficulty > 0) {
    const userRatio = completion.timeSpent / userHistory.avgTimeForDifficulty;
    if (userRatio < 0.2) {
      result.errors.push(
        `Much faster than user's average (${userRatio.toFixed(2)}x)`,
      );
      result.suspicious = true;
    }
  }
  const isDuplicate = userHistory.previousCompletions.some(
    (c) =>
      c.challengeId === completion.challengeId &&
      Math.abs(c.completedAt - completion.completedAt) < 60000,
  );
  if (isDuplicate) {
    result.errors.push('Duplicate completion detected');
    result.valid = false;
  }
  if (result.suspicious) {
    eventBus.publish('analytics:track', {
      event: 'challenge_suspicious_completion',
      properties: {
        challengeId: completion.challengeId,
        userId: completion.userId,
        timeSpent: completion.timeSpent,
        difficulty: challenge.difficulty,
      },
    });
  }
  return result;
}
export interface DifficultyMetrics {
  completionRate: number;
  avgTimeSpent: number;
  avgAttempts: number;
  abandonmentRate: number;
}
export function analyzeChallengeBalance(
  metrics: DifficultyMetrics,
  expected: {
    targetCompletionRate: number;
    targetTimeSpent: number;
    maxAbandonmentRate: number;
  },
): {
  balanced: boolean;
  recommendations: string[];
  difficultyAdjustment: number;
} {
  const recommendations: string[] = [];
  let adjustment = 0;
  const completionDiff = metrics.completionRate - expected.targetCompletionRate;
  if (completionDiff > 0.3) {
    recommendations.push('Challenge too easy - consider increasing difficulty');
    adjustment += 1;
  } else if (completionDiff < -0.3) {
    recommendations.push('Challenge too hard - consider decreasing difficulty');
    adjustment -= 1;
  }
  const timeRatio = metrics.avgTimeSpent / expected.targetTimeSpent;
  if (timeRatio < 0.5) {
    recommendations.push('Players finishing too quickly');
    adjustment += 0.5;
  } else if (timeRatio > 2) {
    recommendations.push('Players taking too long (possible frustration)');
    adjustment -= 0.5;
  }
  if (metrics.abandonmentRate > expected.maxAbandonmentRate) {
    recommendations.push('High abandonment rate - review challenge design');
    adjustment -= 0.5;
  }
  if (metrics.avgAttempts > 10) {
    recommendations.push('High retry count - may need clearer instructions');
  }
  return {
    balanced: recommendations.length === 0,
    recommendations,
    difficultyAdjustment: adjustment,
  };
}
export const ChallengeValidation = {
  validateChallengeCompletion,
  analyzeChallengeBalance,
  ChallengeDifficultySchema,
  ChallengeCompletionSchema,
};
export default ChallengeValidation;
