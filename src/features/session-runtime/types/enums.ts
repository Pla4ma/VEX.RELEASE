/**
 * ponytail: re-export canonical enums from session module
 * Exact duplicate of src/session/types/enums.ts — consolidated here.
 */
export {
  SessionStatusSchema,
  SessionPhaseSchema,
  ConflictStatusSchema,
  StorageStatusSchema,
  SyncStatusSchema,
  AntiCheatStatusSchema,
} from '../../../session/types/enums';

export type {
  SessionStatus,
  SessionPhase,
  ConflictStatus,
  StorageStatus,
  SyncStatus,
  AntiCheatStatus,
} from '../../../session/types/enums';
