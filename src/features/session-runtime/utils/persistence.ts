/**
 * Session Persistence — canonical implementation lives in src/session/utils/persistence.ts
 *
 * This file re-exports everything from the canonical location to eliminate
 * code duplication while preserving the same public API surface.
 *
 * All implementations (persistSessionState, loadPersistedSession, SessionPersistence,
 * PersistedSessionState, etc.) are defined in src/session/utils/persistence.ts.
 *
 * NOTE: Sibling persistence-* helpers (persistence-history, persistence-recovery,
 * persistence-resume) are also imported and re-exported from the canonical location.
 */

export {
  persistSessionState,
  loadPersistedSession,
  clearPersistedSession,
  hasPersistedSession,
  getTimeSinceLastPersist,
  addToSessionHistory,
  getSessionHistory,
  recordRecoveryAttempt,
  getRecoveryAttempts,
  getRecoverySuccessRate,
  isSessionStale,
  canResumeSession,
  SessionPersistenceError,
  SessionPersistence,
} from '../../../session/utils/persistence';

export type {
  PersistedSessionState,
  SessionHistoryEntry,
  RecoveryAttempt,
} from '../../../session/utils/persistence';

export { default } from '../../../session/utils/persistence';
