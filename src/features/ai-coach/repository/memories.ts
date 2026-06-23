/**
 * Coach Memories Repository
 *
 * Supabase-backed storage for coach memories.
 * Replaces the in-memory Map that reset on app close.
 */
export {
  hasEvidenceConflict,
  createMemory,
  getMemoriesByUser,
} from './memories-core';
export {
  getMemoriesByType,
  markMemoryReferenced,
  deleteMemory,
  getMemoriesByTypes,
  getMostRecentMemoryByType,
  hasMemoryOfType,
} from './memories-operations';
export { storeMemoryEmbedding, matchCoachMemories } from './memory-vectors';
