/**
 * Session Stakes System
 * Users choose difficulty before starting, creating commitment and consequences
 * Casual (50% XP, unlimited pauses) → Focused (100% XP, 2 pauses) → Deep Work (150% XP + gem wager, no pauses)
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const SessionDifficultySchema = z.enum(['CASUAL', 'FOCUSED', 'DEEP_WORK']);

export const SessionStakesSchema = z.object({
  difficulty: SessionDifficultySchema,
  xpMultiplier: z.number().min(0.5).max(2.0),
  maxPauses: z.number().int().min(0),
  pausePenaltyPercent: z.number().min(0).max(100),
  gemWager: z.number().int().min(0),
  strictMode: z.boolean(),
  failureConsequence: z.enum(['NONE', 'REDUCED_XP', 'LOSE_WAGER']),
});

export const UserStakesPreferenceSchema = z.object({
  userId: z.string().uuid(),
  defaultDifficulty: SessionDifficultySchema,
  totalDeepWorkCompleted: z.number().int().default(0),
  totalGemsWagered: z.number().int().default(0),
  totalGemsWon: z.number().int().default(0),
  currentWinStreak: z.number().int().default(0),
  bestWinStreak: z.number().int().default(0),
});

// ============================================================================
// Constants
// ============================================================================

export const DIFFICULTY_CONFIG = {
  CASUAL: {
    xpMultiplier: 0.5,
    maxPauses: Infinity,
    pausePenaltyPercent: 10,
    gemWager: 0,
    strictMode: false,
    failureConsequence: 'NONE' as const,
    label: 'Casual',
    description: 'Practice mode. Unlimited pauses. 50% XP.',
    icon: '🌱',
    color: '#4CAF50',
  },
  FOCUSED: {
    xpMultiplier: 1.0,
    maxPauses: 2,
    pausePenaltyPercent: 25,
    gemWager: 0,
    strictMode: false,
    failureConsequence: 'NONE' as const,
    label: 'Focused',
    description: 'Standard mode. 2 pauses allowed. 100% XP.',
    icon: '🔥',
    color: '#FF9800',
  },
  DEEP_WORK: {
    xpMultiplier: 1.5,
    maxPauses: 0,
    pausePenaltyPercent: 100,
    gemWager: 5,
    strictMode: true,
    failureConsequence: 'LOSE_WAGER' as const,
    label: 'Deep Work',
    description: 'No pauses. Wager 5 gems. 150% XP if completed, lose gems if abandoned.',
    icon: '⚡',
    color: '#9C27B0',
  },
} as const;

// ============================================================================
// Types
// ============================================================================

export type SessionDifficulty = z.infer<typeof SessionDifficultySchema>;
export type SessionStakes = z.infer<typeof SessionStakesSchema>;
export type UserStakesPreference = z.infer<typeof UserStakesPreferenceSchema>;

export interface StakesSessionResult {
  sessionId: string;
  userId: string;
  difficulty: SessionDifficulty;
  completed: boolean;
  xpEarned: number;
  baseXp: number;
  gemWager: number;
  gemsWon: number;
  gemsLost: number;
  pausesUsed: number;
  qualityScore: number;
  winStreakUpdated: number;
}

// ============================================================================
// Stakes Selection
// ============================================================================

export function getStakesForDifficulty(difficulty: SessionDifficulty): SessionStakes {
  const config = DIFFICULTY_CONFIG[difficulty];
  return SessionStakesSchema.parse({
    difficulty,
    xpMultiplier: config.xpMultiplier,
    maxPauses: config.maxPauses === Infinity ? 999 : config.maxPauses,
    pausePenaltyPercent: config.pausePenaltyPercent,
    gemWager: config.gemWager,
    strictMode: config.strictMode,
    failureConsequence: config.failureConsequence,
  });
}

export function canSelectDifficulty(
  userLevel: number,
  difficulty: SessionDifficulty
): { allowed: boolean; reason?: string } {
  // Deep Work locked until level 3
  if (difficulty === 'DEEP_WORK' && userLevel < 3) {
    return {
      allowed: false,
      reason: 'Deep Work unlocks at level 3',
    };
  }
  return { allowed: true };
}

export function getRecommendedDifficulty(
  userLevel: number,
  recentCompletionRate: number,
  currentStreak: number
): SessionDifficulty {
  // New users: Start with Casual
  if (userLevel < 2) {
    return 'CASUAL';
  }

  // Struggling users: Keep it Casual
  if (recentCompletionRate < 0.6) {
    return 'CASUAL';
  }

  // High performers with good streak: Recommend Deep Work
  if (currentStreak >= 7 && recentCompletionRate > 0.85 && userLevel >= 5) {
    return 'DEEP_WORK';
  }

  // Default to Focused
  return 'FOCUSED';
}

// ============================================================================
// Session Completion with Stakes
// ============================================================================

export function calculateStakesResult(
  sessionId: string,
  userId: string,
  difficulty: SessionDifficulty,
  completed: boolean,
  baseXp: number,
  pausesUsed: number,
  totalDuration: number,
  userWinStreak: number
): StakesSessionResult {
  const stakes = getStakesForDifficulty(difficulty);

  let xpEarned = 0;
  let gemsWon = 0;
  let gemsLost = 0;
  let newWinStreak = userWinStreak;

  if (completed) {
    // Calculate XP with multiplier
    xpEarned = Math.floor(baseXp * stakes.xpMultiplier);

    // Deep Work bonus gems
    if (difficulty === 'DEEP_WORK') {
      gemsWon = stakes.gemWager; // Win your wager back
      gemsWon += Math.min(3, Math.floor(totalDuration / 30 / 60)); // +1 gem per 30 min, max 3
      newWinStreak = userWinStreak + 1;
    }
  } else {
    // Abandoned session
    if (stakes.failureConsequence === 'LOSE_WAGER' && stakes.gemWager > 0) {
      gemsLost = stakes.gemWager;
    }

    // Reset win streak on failure
    newWinStreak = 0;

    // Reduced XP for partial completion (if not Deep Work)
    if (stakes.failureConsequence === 'REDUCED_XP') {
      xpEarned = Math.floor(baseXp * 0.25); // 25% for trying
    }
  }

  // Calculate quality score based on stakes
  const pausePenalty = Math.min(pausesUsed * stakes.pausePenaltyPercent, 50);
  const qualityScore = Math.max(0, 100 - pausePenalty);

  return {
    sessionId,
    userId,
    difficulty,
    completed,
    xpEarned,
    baseXp,
    gemWager: stakes.gemWager,
    gemsWon,
    gemsLost,
    pausesUsed,
    qualityScore,
    winStreakUpdated: newWinStreak,
  };
}

// ============================================================================
// Stakes Analytics & Rewards
// ============================================================================

export async function recordStakesResult(result: StakesSessionResult): Promise<void> {
  try {
    // Publish event for progression system
    eventBus.publish('session:stakes_completed', result);

    // Special rewards for Deep Work streaks
    if (result.difficulty === 'DEEP_WORK' && result.completed) {
      if (result.winStreakUpdated >= 3) {
        (eventBus as any).publish('achievement:unlocked', {
          userId: result.userId,
          achievementId: 'deep_work_streak_3',
        });
      }
      if (result.winStreakUpdated >= 7) {
        (eventBus as any).publish('achievement:unlocked', {
          userId: result.userId,
          achievementId: 'deep_work_streak_7',
        });
      }
    }

    // Track analytics
    Sentry.addBreadcrumb({
      category: 'session_stakes',
      message: `Session completed with ${result.difficulty}: ${result.completed ? 'success' : 'abandoned'}`,
      data: {
        difficulty: result.difficulty,
        xpEarned: result.xpEarned,
        gemsWon: result.gemsWon,
        gemsLost: result.gemsLost,
      },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'session_stakes', action: 'record_result' },
    });
  }
}

// ============================================================================
// Stakes UI Helpers
// ============================================================================

export function getDifficultyDisplay(difficulty: SessionDifficulty): {
  label: string;
  description: string;
  icon: string;
  color: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  const config = DIFFICULTY_CONFIG[difficulty];
  return {
    label: config.label,
    description: config.description,
    icon: config.icon,
    color: config.color,
    riskLevel: difficulty === 'CASUAL' ? 'LOW' : difficulty === 'FOCUSED' ? 'MEDIUM' : 'HIGH',
  };
}

export function formatStakesSummary(result: StakesSessionResult): string {
  if (!result.completed) {
    if (result.gemsLost > 0) {
      return `💔 Abandoned! Lost ${result.gemsLost} gems. Try Focused mode next time?`;
    }
    return '⚠️ Session abandoned. No rewards earned.';
  }

  const difficultyConfig = DIFFICULTY_CONFIG[result.difficulty];
  let summary = `${difficultyConfig.icon} ${difficultyConfig.label} complete! +${result.xpEarned} XP`;

  if (result.gemsWon > 0) {
    summary += ` (+${result.gemsWon} gems)`;
  }

  if (result.winStreakUpdated > 1 && result.difficulty === 'DEEP_WORK') {
    summary += ` 🔥 ${result.winStreakUpdated} win streak!`;
  }

  return summary;
}
