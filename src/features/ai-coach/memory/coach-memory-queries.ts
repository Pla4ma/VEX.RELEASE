import type { MessageCategory } from './types';
import { createDebugger } from '../../utils/debug';
import {
  getMemoriesByUser as repoGetMemoriesByUser,
  getMemoriesByType as repoGetMemoriesByType,
  markMemoryReferenced as repoMarkMemoryReferenced,
} from './repository/memories';
import {
  MemoryTypeSchema,
  type CoachMemory,
  type MemoryType,
} from './memory-schemas';

const debug = createDebugger('ai-coach:memory');

async function getUserMemoriesInternal(userId: string): Promise<CoachMemory[]> {
  try {
    return await repoGetMemoriesByUser(userId);
  } catch (error) {
    debug.warn(
      '[CoachMemory] Failed to fetch memories, returning empty:',
      error,
    );
    return [];
  }
}

async function getMemoriesByTypeInternal(
  userId: string,
  type: MemoryType,
): Promise<CoachMemory[]> {
  try {
    return await repoGetMemoriesByType(userId, type);
  } catch (error) {
    debug.warn(
      '[CoachMemory] Failed to fetch memories by type, returning empty:',
      error,
    );
    return [];
  }
}

async function markMemoryReferencedInternal(memoryId: string): Promise<void> {
  try {
    await repoMarkMemoryReferenced(memoryId);
  } catch (error) {
    debug.warn('[CoachMemory] Failed to mark memory referenced:', error);
  }
}

export async function getRelevantMemories(
  userId: string,
  category: MessageCategory,
  limit: number = 3,
): Promise<CoachMemory[]> {
  const allMemories = await getUserMemoriesInternal(userId);
  const scoredMemories = allMemories.map((memory) => {
    let score = 0;
    const daysSince = (Date.now() - memory.occurredAt) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSince);
    switch (category) {
      case 'STREAK_RISK':
        if (memory.type === 'BEST_STREAK') {score += 10;}
        if (memory.type === 'FIRST_S_GRADE') {score += 5;}
        break;
      case 'SESSION_SUGGESTION':
        if (memory.type === 'LONGEST_SESSION') {score += 10;}
        if (memory.type === 'FIRST_S_GRADE') {score += 5;}
        break;
      case 'MILESTONE_HYPE':
        if (memory.type.includes('MILESTONE') || memory.type.includes('FIRST'))
          {score += 10;}
        break;
      case 'COMEBACK_SUPPORT':
        if (memory.type === 'BEST_STREAK') {score += 8;}
        if (memory.type === 'FIRST_S_GRADE') {score += 5;}
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
    await markMemoryReferencedInternal(memory.id);
  }
  return selected;
}

export async function getOnboardingGoal(
  userId: string,
): Promise<string | null> {
  const memories = await getMemoriesByTypeInternal(userId, 'ONBOARDING_GOAL');
  if (memories.length === 0) {return null;}
  const sorted = memories.sort((a, b) => b.occurredAt - a.occurredAt);
  const latest = sorted[0];
  if (!latest) {return null;}
  const goal = latest.metadata.goal;
  return typeof goal === 'string' ? goal : null;
}

export async function getMilestoneSummary(userId: string): Promise<{
  totalMemories: number;
  mostRecent: CoachMemory | null;
  favoriteType: MemoryType | null;
  streakOfSGrades: number;
}> {
  const memories = await getUserMemoriesInternal(userId);
  if (memories.length === 0) {
    return {
      totalMemories: 0,
      mostRecent: null,
      favoriteType: null,
      streakOfSGrades: 0,
    };
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
    if (parsed.success) {favoriteType = parsed.data;}
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
