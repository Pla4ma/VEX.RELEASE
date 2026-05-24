import type { MessageCategory } from './types';
import { createDebugger } from '../../utils/debug';
import {
  createMemory as repoCreateMemory,
  getMemoriesByUser as repoGetMemoriesByUser,
  getMemoriesByType as repoGetMemoriesByType,
  markMemoryReferenced as repoMarkMemoryReferenced,
} from './repository/memories';
import { MemoryTypeSchema, type CoachMemory, type MemoryType } from './memory-schemas';

const debug = createDebugger('ai-coach:memory');

export type { CoachMemory, MemoryType };

export {
  storeStudyPattern,
  storePreferredTechnique,
  storeFailureMode,
  storeOptimalFocusTime,
  storeDocumentMilestone,
  getStudyPatterns,
  getPreferredTechniques,
  getFailureModes,
  getOptimalFocusTimes,
} from './memory-patterns';

export {
  checkFirstSGrade,
  checkLongestSession,
  checkBestStreak,
  checkFirstBossDefeated,
  checkFirstRivalWin,
} from './memory-milestones';

export { generateMemoryReferenceMessage } from './memory-reference-message';

export interface UserMilestones {
  firstSGrade: CoachMemory | null;
  longestSession: CoachMemory | null;
  bestStreak: CoachMemory | null;
  firstBossDefeated: CoachMemory | null;
  firstRivalWin: CoachMemory | null;
  onboardingGoal: string | null;
  recentAchievements: CoachMemory[];
  studyPatterns: CoachMemory[];
  preferredTechniques: CoachMemory[];
  failureModes: CoachMemory[];
}

export async function storeMemory(
  userId: string,
  type: MemoryType,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {},
): Promise<CoachMemory> {
  const memory = await repoCreateMemory(userId, type, title, description, metadata);
  debug.info('[CoachMemory] Stored: %s for user %s', type, userId);
  return memory;
}

export async function getUserMemories(userId: string): Promise<CoachMemory[]> {
  try {
    return await repoGetMemoriesByUser(userId);
  } catch (error) {
    debug.warn('[CoachMemory] Failed to fetch memories, returning empty:', error);
    return [];
  }
}

export async function getMemoriesByType(
  userId: string,
  type: MemoryType,
): Promise<CoachMemory[]> {
  try {
    return await repoGetMemoriesByType(userId, type);
  } catch (error) {
    debug.warn('[CoachMemory] Failed to fetch memories by type, returning empty:', error);
    return [];
  }
}

export async function markMemoryReferenced(memoryId: string): Promise<void> {
  try {
    await repoMarkMemoryReferenced(memoryId);
  } catch (error) {
    debug.warn('[CoachMemory] Failed to mark memory referenced:', error);
  }
}

export async function storeOnboardingGoal(userId: string, goal: string): Promise<CoachMemory> {
  return storeMemory(userId, 'ONBOARDING_GOAL', 'Your Goal', `You said you wanted to: ${goal}`, {
    goal,
  });
}

export async function getRelevantMemories(
  userId: string,
  category: MessageCategory,
  limit: number = 3,
): Promise<CoachMemory[]> {
  const allMemories = await getUserMemories(userId);
  const scoredMemories = allMemories.map((memory) => {
    let score = 0;
    const daysSince = (Date.now() - memory.occurredAt) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSince);
    switch (category) {
      case 'STREAK_RISK':
        if (memory.type === 'BEST_STREAK') score += 10;
        if (memory.type === 'FIRST_S_GRADE') score += 5;
        break;
      case 'SESSION_SUGGESTION':
        if (memory.type === 'LONGEST_SESSION') score += 10;
        if (memory.type === 'FIRST_S_GRADE') score += 5;
        break;
      case 'MILESTONE_HYPE':
        if (memory.type.includes('MILESTONE') || memory.type.includes('FIRST')) score += 10;
        break;
      case 'COMEBACK_SUPPORT':
        if (memory.type === 'BEST_STREAK') score += 8;
        if (memory.type === 'FIRST_S_GRADE') score += 5;
        break;
      default:
        break;
    }
    score -= memory.referencedCount * 2;
    return { memory, score };
  });
  scoredMemories.sort((a, b) => b.score - a.score);
  const selected = scoredMemories.slice(0, limit).map((s) => s.memory);
  for (const memory of selected) {
    await markMemoryReferenced(memory.id);
  }
  return selected;
}

export async function getOnboardingGoal(userId: string): Promise<string | null> {
  const memories = await getMemoriesByType(userId, 'ONBOARDING_GOAL');
  if (memories.length === 0) {
    return null;
  }
  const sorted = memories.sort((a, b) => b.occurredAt - a.occurredAt);
  const latest = sorted[0];
  if (!latest) {
    return null;
  }
  const goal = latest.metadata.goal;
  return typeof goal === 'string' ? goal : null;
}

export async function getMilestoneSummary(userId: string): Promise<{
  totalMemories: number;
  mostRecent: CoachMemory | null;
  favoriteType: MemoryType | null;
  streakOfSGrades: number;
}> {
  const memories = await getUserMemories(userId);
  if (memories.length === 0) {
    return { totalMemories: 0, mostRecent: null, favoriteType: null, streakOfSGrades: 0 };
  }
  const sorted = memories.sort((a, b) => b.occurredAt - a.occurredAt);
  const mostRecent = sorted[0] ?? null;
  const typeCounts = memories.reduce<Record<string, number>>((acc, m) => {
    acc[m.type] = (acc[m.type] ?? 0) + 1;
    return acc;
  }, {});
  const topEntry = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  let favoriteType: MemoryType | null = null;
  if (topEntry) {
    const parsed = MemoryTypeSchema.safeParse(topEntry[0]);
    if (parsed.success) {
      favoriteType = parsed.data;
    }
  }
  const sGradeCount = memories.filter(
    (m) => m.type === 'FIRST_S_GRADE' || m.metadata.grade === 'S',
  ).length;
  return {
    totalMemories: memories.length,
    mostRecent,
    favoriteType,
    streakOfSGrades: sGradeCount,
  };
}
