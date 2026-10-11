import { countCompletedSessions } from '../session-history/repository';
import { WHAT_VEX_LEARNED_MIN_SESSIONS } from './memory-panel-types';

export async function canShowMemoryConsole(
  userId: string | null,
): Promise<boolean> {
  if (!userId) {
    return false;
  }
  const completedSessions = await countCompletedSessions(userId);
  return completedSessions >= WHAT_VEX_LEARNED_MIN_SESSIONS;
}

export {
  hasEvidenceConflict,
  createMemoryCandidate,
  acceptMemory,
  deleteMemory,
  listActiveMemories,
  listDeletedMemoryHashes,
  findMemoriesForRecommendation,
} from './memory-operations';

export {
  hashEvidence,
  buildColdStartEvidence,
  buildMemoryEvidence,
  generateRecommendationEvidence,
  canClaimStrongPattern,
  scopeMessageForSource,
  isImportSourceMemory,
  filterImportMemories,
} from './evidence';

export type { FocusMemory } from './schemas';
