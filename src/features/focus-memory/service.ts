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

import { useMemo } from 'react';
export { useMemo };
export type FocusMemory = { id: string; userId: string; content: string; createdAt: number; summary: string; confidence: number; type: string; source: string; evidenceHash: string };
export function useActiveFocusMemories(_userId: string | null) { return useMemo(() => ({ data: [] as FocusMemory[], refetch: () => {} }), []); }
export function useMemoryConsoleVisibility(_userId: string | null) { return useMemo(() => ({ isVisible: true }), []); }
