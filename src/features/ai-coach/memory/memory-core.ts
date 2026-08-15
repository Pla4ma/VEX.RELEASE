/**
 * CoachMemory core CRUD operations (extracted to break require cycles
 * between CoachMemory.ts and the per-type memory helpers under memory/).
 */

import {
  createMemory as repoCreateMemory,
  getMemoriesByUser as repoGetMemoriesByUser,
  getMemoriesByType as repoGetMemoriesByType,
  markMemoryReferenced as repoMarkMemoryReferenced,
  deleteMemory as repoDeleteMemory,
} from '../repository/memories';
import type { CoachMemory, MemoryType } from './memory-schemas';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('ai-coach:memory');

export async function storeMemory(
  userId: string,
  type: MemoryType,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {},
): Promise<CoachMemory> {
  const memory = await repoCreateMemory(
    userId,
    type,
    title,
    description,
    metadata,
  );
  debug.info('[CoachMemory] Stored: %s for user %s', type, userId);
  return memory;
}

export async function getUserMemories(userId: string): Promise<CoachMemory[]> {
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

export async function getMemoriesByType(
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

export async function markMemoryReferenced(memoryId: string): Promise<void> {
  try {
    await repoMarkMemoryReferenced(memoryId);
  } catch (error) {
    debug.warn('[CoachMemory] Failed to mark memory referenced:', error);
  }
}

export async function removeMemory(memoryId: string): Promise<void> {
  try {
    await repoDeleteMemory(memoryId);
    debug.info('[CoachMemory] Removed: %s', memoryId);
  } catch (error) {
    debug.warn('[CoachMemory] Failed to delete memory:', error);
  }
}
