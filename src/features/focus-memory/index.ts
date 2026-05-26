export { trackFocusMemoryChanged } from './analytics';
export { useActiveFocusMemories } from './hooks';
export { useMemoryConsoleVisibility } from './useMemoryConsoleVisibility';
export { syncMemoriesToSupabase, fetchMemoriesFromSupabase } from './repository';
export {
  acceptMemory,
  buildColdStartEvidence,
  buildMemoryEvidence,
  canClaimStrongPattern,
  createMemoryCandidate,
  deleteMemory,
  filterImportMemories,
  findMemoriesForRecommendation,
  generateRecommendationEvidence,
  hashEvidence,
  hasEvidenceConflict,
  isImportSourceMemory,
  listActiveMemories,
  listDeletedMemoryHashes,
  scopeMessageForSource,
} from './service';
export type {
  ColdStartReason,
  CreateMemoryCandidateInput,
  FocusMemory,
  FocusMemoryType,
  MemoryRecommendationInput,
  RecommendationEvidence,
} from './types';
