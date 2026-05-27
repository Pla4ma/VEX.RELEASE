import type { CompletionLedger, CompletionSyncStatus } from "./schemas";

export interface SessionCompletionSyncOptions {
  forceSync?: boolean;
  skipQueue?: boolean;
  maxRetries?: number;
}

export interface OfflineSyncReport {
  queueSize: number;
  successRate: number;
  averageRetryCount: number;
  lastSyncTime: number | null;
  isHealthy: boolean;
  issues: string[];
  timestamp: number;
}

export class SessionCompletionOfflineSyncError extends Error {
  constructor(
    public operation: string,
    public cause: unknown,
  ) {
    super(
      `Session completion offline sync failed during ${operation}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = "SessionCompletionOfflineSyncError";
  }
}

export interface QueueResult {
  queued: boolean;
  synced: boolean;
  entryId?: string;
  error?: Error;
}

export interface SyncStatusResult {
  status: CompletionSyncStatus;
  isQueued: boolean;
  hasFallback: boolean;
  lastSyncAt?: number;
}

export interface ForceRetryResult {
  attempted: number;
  successful: number;
  failed: number;
}

export interface DiagnosticsResult {
  fallbackEntriesCount: number;
  lastSyncAt: number;
  isInitialized: boolean;
  oldestEntryAge?: number;
}
