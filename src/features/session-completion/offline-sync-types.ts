export type SessionCompletionSyncOptions = {
  forceSync?: boolean;
  maxRetries?: number;
  skipQueue?: boolean;
};
export type OfflineSyncReport = {
  averageRetryCount: number;
  isHealthy: boolean;
  issues: string[];
  lastSyncTime: number | null;
  queueSize: number;
  successRate: number;
  timestamp: number;
};
export type QueueResult = {
  entryId?: string;
  error?: Error;
  queued: boolean;
  synced: boolean;
};
export type SyncStatusResult = {
  hasFallback: boolean;
  isQueued: boolean;
  lastSyncAt: number;
  status: string;
};
export type ForceRetryResult = {
  attempted: number;
  failed: number;
  successful: number;
};
export type DiagnosticsResult = {
  fallbackEntriesCount: number;
  isInitialized: boolean;
  lastSyncAt: number;
  oldestEntryAge?: number;
};

export class SessionCompletionOfflineSyncError extends Error {
  constructor(operation: string, public readonly cause: unknown) {
    super(`Session completion offline sync failed: ${operation}`);
    this.name = 'SessionCompletionOfflineSyncError';
  }
}
