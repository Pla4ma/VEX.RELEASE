export { trackFocusMemoryChanged } from "./analytics";
export { useActiveFocusMemories } from "./hooks";
export { useMemoryConsoleVisibility } from "./useMemoryConsoleVisibility";
export { useMemoryPanel } from "./useMemoryPanel";
export { MemoryPanel } from "./components/MemoryPanel";
export {
  MemoryPanelItemSchema,
  WHAT_VEX_LEARNED_MIN_SESSIONS,
} from "./memory-panel-types";
export type { MemoryPanelItem } from "./memory-panel-types";
export {
  syncMemoriesToSupabase,
  fetchMemoriesFromSupabase,
} from "./repository";
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
} from "./service";
export type {
  ColdStartReason,
  CreateMemoryCandidateInput,
  EvidenceLaneContext,
  FocusMemory,
  FocusMemoryType,
  MemoryRecommendationInput,
  RecommendationEvidence,
} from "./types";
