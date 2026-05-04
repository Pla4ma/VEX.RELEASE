/**
 * Milestones Engine
 * Manages milestone tracking, evaluation, and unlock system
 *
 * Dependencies:
 * - Progression (level milestones)
 * - Streaks (streak milestones)
 * - Rewards (milestone rewards)
 * - Boss (boss defeat milestones)
 */

import {
  CheckMilestoneInputSchema,
  type Milestone,
  type MilestoneProgress,
  type MilestoneType,
  type Unlock,
  type CheckMilestoneInput,
} from './schemas';

// ============================================================================
// Milestone Definitions
// ============================================================================

const MILESTONE_DEFINITIONS: Record<string, Partial<Milestone>> = {
  // Level milestones
  'level-3': { type: 'LEVEL', threshold: 3, name: 'Novice', description: 'Reach level 3' },
  'level-5': { type: 'LEVEL', threshold: 5, name: 'Apprentice', description: 'Reach level 5' },
  'level-10': { type: 'LEVEL', threshold: 10, name: 'Adept', description: 'Reach level 10' },
  'level-20': { type: 'LEVEL', threshold: 20, name: 'Expert', description: 'Reach level 20' },
  'level-50': { type: 'LEVEL', threshold: 50, name: 'Master', description: 'Reach level 50' },

  // Streak milestones
  'streak-3': { type: 'STREAK_DAYS', threshold: 3, name: 'Getting Started', description: '3 day streak' },
  'streak-7': { type: 'STREAK_DAYS', threshold: 7, name: 'Week Warrior', description: '7 day streak' },
  'streak-14': { type: 'STREAK_DAYS', threshold: 14, name: 'Two Week Streak', description: '14 day streak' },
  'streak-30': { type: 'STREAK_DAYS', threshold: 30, name: 'Monthly Master', description: '30 day streak' },
  'streak-100': { type: 'STREAK_DAYS', threshold: 100, name: 'Centurion', description: '100 day streak' },

  // Session milestones
  'sessions-10': { type: 'SESSIONS_COMPLETED', threshold: 10, name: 'Beginner', description: 'Complete 10 sessions' },
  'sessions-50': { type: 'SESSIONS_COMPLETED', threshold: 50, name: 'Regular', description: 'Complete 50 sessions' },
  'sessions-100': { type: 'SESSIONS_COMPLETED', threshold: 100, name: 'Veteran', description: 'Complete 100 sessions' },
  'sessions-500': { type: 'SESSIONS_COMPLETED', threshold: 500, name: 'Focus Master', description: 'Complete 500 sessions' },

  // Boss milestones
  'boss-1': { type: 'BOSS_DEFEATS', threshold: 1, name: 'First Victory', description: 'Defeat your first boss' },
  'boss-5': { type: 'BOSS_DEFEATS', threshold: 5, name: 'Boss Hunter', description: 'Defeat 5 bosses' },
  'boss-10': { type: 'BOSS_DEFEATS', threshold: 10, name: 'Boss Slayer', description: 'Defeat 10 bosses' },
};

function createMilestoneProgress(
  milestoneId: string,
  currentValue: number,
  threshold: number,
  completed: boolean
): MilestoneProgress {
  const now = Date.now();
  return {
    id: `${milestoneId}-progress`,
    milestoneId,
    currentValue,
    threshold,
    percentComplete: threshold > 0 ? Math.min(100, Math.floor((currentValue / threshold) * 100)) : 0,
    completed,
    completedAt: completed ? now : null,
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// Milestone Engine
// ============================================================================

export function checkMilestone(input: CheckMilestoneInput): {
  completed: boolean;
  progress: MilestoneProgress;
} {
  const validated = CheckMilestoneInputSchema.parse(input);
  const definition = MILESTONE_DEFINITIONS[validated.milestoneId];

  if (!definition || !definition.threshold) {
    return {
      completed: false,
      progress: createMilestoneProgress(validated.milestoneId, validated.currentValue, 0, false),
    };
  }

  const completed = validated.currentValue >= definition.threshold;

  return {
    completed,
    progress: createMilestoneProgress(
      validated.milestoneId,
      validated.currentValue,
      definition.threshold,
      completed
    ),
  };
}

export function getMilestonesByType(type: MilestoneType): string[] {
  return Object.entries(MILESTONE_DEFINITIONS)
    .filter(([_, def]) => def.type === type)
    .map(([id]) => id);
}

export function getMilestoneProgress(
  milestoneId: string,
  currentValue: number
): MilestoneProgress | null {
  const definition = MILESTONE_DEFINITIONS[milestoneId];
  if (!definition || !definition.threshold) {return null;}

  const completed = currentValue >= definition.threshold;

  return createMilestoneProgress(milestoneId, currentValue, definition.threshold, completed);
}

// ============================================================================
// Milestone Timeline
// ============================================================================

export function buildMilestoneTimeline(
  userId: string,
  progressMap: Record<string, number>
): {
  milestones: Array<{
    milestoneId: string;
    progress: MilestoneProgress;
    position: number;
  }>;
  completedCount: number;
  totalCount: number;
  nextMilestone: { milestoneId: string; progress: MilestoneProgress } | null;
} {
  let position = 0;
  let completedCount = 0;
  let nextMilestone: { milestoneId: string; progress: MilestoneProgress } | null = null;

  const milestones = Object.keys(MILESTONE_DEFINITIONS).map((milestoneId) => {
    const progress = getMilestoneProgress(
      milestoneId,
      progressMap[milestoneId] || 0
    )!;

    if (progress.completed) {
      completedCount++;
    } else if (!nextMilestone) {
      nextMilestone = { milestoneId, progress };
    }

    return {
      milestoneId,
      progress,
      position: position++,
    };
  });

  return {
    milestones,
    completedCount,
    totalCount: milestones.length,
    nextMilestone,
  };
}

// ============================================================================
// Unlock System
// ============================================================================

const UNLOCK_DEFINITIONS: Unlock[] = [
  { id: 'unlock-boss', type: 'FEATURE', featureId: 'boss-battles', name: 'Boss Battles', description: 'Challenge focus bosses', minLevel: 3, requiredMilestoneId: null, unlockedAt: null },
  { id: 'unlock-squads', type: 'FEATURE', featureId: 'squads', name: 'Squads', description: 'Join or create squads', minLevel: 5, requiredMilestoneId: null, unlockedAt: null },
  { id: 'unlock-coach', type: 'FEATURE', featureId: 'ai-coach', name: 'AI Coach', description: 'Get personalized coaching', minLevel: 8, requiredMilestoneId: null, unlockedAt: null },
  { id: 'unlock-challenges', type: 'FEATURE', featureId: 'squad-challenges', name: 'Squad Challenges', description: 'Complete squad challenges', minLevel: 12, requiredMilestoneId: null, unlockedAt: null },
  { id: 'unlock-themes', type: 'COSMETIC', featureId: 'custom-themes', name: 'Custom Themes', description: 'Unlock custom app themes', minLevel: 15, requiredMilestoneId: null, unlockedAt: null },
];

export function getUnlocksForLevel(level: number): Unlock[] {
  return UNLOCK_DEFINITIONS.filter(
    (unlock) => unlock.minLevel <= level && !unlock.unlockedAt
  );
}

export function checkUnlockStatus(
  featureId: string,
  userLevel: number
): { unlocked: boolean; requiredLevel: number } {
  const unlock = UNLOCK_DEFINITIONS.find((u) => u.featureId === featureId);
  if (!unlock) {return { unlocked: true, requiredLevel: 1 };}

  return {
    unlocked: userLevel >= unlock.minLevel,
    requiredLevel: unlock.minLevel,
  };
}

// ============================================================================
// Milestone Evaluation
// ============================================================================

export function evaluateMilestones(
  userId: string,
  stats: {
    level: number;
    streakDays: number;
    sessionsCompleted: number;
    bossDefeats: number;
  }
): Array<{
  milestoneId: string;
  completed: boolean;
  newlyCompleted: boolean;
}> {
  const results: Array<{ milestoneId: string; completed: boolean; newlyCompleted: boolean }> = [];

  // Evaluate all milestone types
  const levelMilestones = getMilestonesByType('LEVEL');
  const streakMilestones = getMilestonesByType('STREAK_DAYS');
  const sessionMilestones = getMilestonesByType('SESSIONS_COMPLETED');
  const bossMilestones = getMilestonesByType('BOSS_DEFEATS');

  for (const milestoneId of levelMilestones) {
    const result = checkMilestone({
      userId,
      milestoneId,
      currentValue: stats.level,
    });
    results.push({
      milestoneId,
      completed: result.completed,
      newlyCompleted: result.completed && result.progress.completedAt === Date.now(),
    });
  }

  for (const milestoneId of streakMilestones) {
    const result = checkMilestone({
      userId,
      milestoneId,
      currentValue: stats.streakDays,
    });
    results.push({
      milestoneId,
      completed: result.completed,
      newlyCompleted: result.completed && result.progress.completedAt === Date.now(),
    });
  }

  for (const milestoneId of sessionMilestones) {
    const result = checkMilestone({
      userId,
      milestoneId,
      currentValue: stats.sessionsCompleted,
    });
    results.push({
      milestoneId,
      completed: result.completed,
      newlyCompleted: result.completed && result.progress.completedAt === Date.now(),
    });
  }

  for (const milestoneId of bossMilestones) {
    const result = checkMilestone({
      userId,
      milestoneId,
      currentValue: stats.bossDefeats,
    });
    results.push({
      milestoneId,
      completed: result.completed,
      newlyCompleted: result.completed && result.progress.completedAt === Date.now(),
    });
  }

  return results;
}
