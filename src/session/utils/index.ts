/**
 * Session Utilities - Barrel Export
 *
 * Comprehensive utilities for session management.
 *
 * @phase 1 - Deepening: Utility organization
 */

// Core utilities
export {
  SessionPersistence,
  persistSessionState,
  loadPersistedSession,
  clearPersistedSession,
  hasPersistedSession,
  isSessionStale,
  canResumeSession,
  SessionPersistenceError,
  type PersistedSessionState,
} from './persistence';

// Validation utilities
export {
  SessionValidation,
  validateSessionConfig,
  validateSessionStart,
  validateSessionPause,
  validateSessionCompletion,
  FieldValidators,
  formatValidationErrors,
  hasErrors,
  hasWarnings,
  getFirstError,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type SessionValidationInput,
} from './validation';

// Timer hook (exported from hooks directory)
export { useSessionTimer } from '../hooks/useSessionTimer';
