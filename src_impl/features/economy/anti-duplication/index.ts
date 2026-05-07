/**
 * Anti-Duplication - Barrel File
 *
 * Phase 6.04 - Anti-Duplication Systems
 * Exports all anti-duplication validation functionality
 */

// Schemas and types
export type {
  DeduplicationKey,
  DeduplicationRule,
  DeduplicationAttempt,
  DeduplicationRequest,
  DeduplicationResult,
  ExploitPattern,
  ExploitDetection,
  DeduplicationAnalytics,
  AntiDuplicationConfig,
} from './schemas';

// Configuration
export {
  DEFAULT_DEDUPLICATION_RULES,
  DEFAULT_EXPLOIT_PATTERNS,
  DEFAULT_ANTI_DUPLICATION_CONFIG,
} from './config';

// Service
export { antiDuplicationService } from './deduplication-service';

// Hooks
export {
  useValidateDeduplication,
  useActionValidation,
  useDeduplicationAttempts,
  useExploitDetection,
  useDeduplicationRules,
  useDeduplicationAnalytics,
  useDuplicateWarning,
  useExploitAlert,
  useActionStatus,
  useAntiDuplicationEvents,
  antiDuplicationKeys,
} from './hooks';