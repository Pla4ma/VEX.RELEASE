/**
 * Economy Offline Queue
 * Queue for economy operations when offline
 *
 * Features:
 * - Deduplication (same operation not queued twice)
 * - Priority ordering (spends before earns to prevent negative balance)
 * - Conflict resolution (merge similar operations)
 * - Retry with exponential backoff
 * - Persistence to storage
 */

export {
  QueueEntryStatusSchema,
  QueueEntryTypeSchema,
  QueueEntrySchema,
  readStringPayload,
  readNumberPayload,
  toError,
  type QueueEntryStatus,
  type QueueEntryType,
  type QueueEntry,
} from './offline-queue-schemas';

export { OfflineQueue, offlineQueue } from './offline-queue-core';

export {
  createEarnEntry,
  createSpendEntry,
  createConvertEntry,
  createPurchaseEntry,
} from './offline-queue-helpers';

// Processing side-effects attach processQueue and resolveConflicts to OfflineQueue prototype
import './offline-queue-processing';
