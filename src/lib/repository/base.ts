export { RepositoryErrorCode, RepositoryError } from './error-handling';
export {
  type RetryConfig,
  withRetry,
  type ConnectionState,
  getConnectionState,
  subscribeToConnectionChanges,
  updateConnectionState,
} from './retry';
export {
  type VersionedEntity,
  withOptimisticLock,
  type BatchResult,
  batchWithRetry,
  createRetryableQuery,
} from './batch-operations';
