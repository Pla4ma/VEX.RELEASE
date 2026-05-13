export interface CompleteSessionWithOfflineSyncInput extends BuildCompletionLedgerInput {
    /** Force immediate sync attempt */
    forceSync?: boolean;
    /** Custom sync options */
    syncOptions?: {
        maxRetries?: number;
        skipQueue?: boolean;
        };
}

export interface CompleteSessionWithOfflineSyncResult {
    /** Session completion was successful */
    success: boolean;
    /** Session was synced immediately */
    syncedImmediately: boolean;
    /** Session is queued for offline sync */
    queuedForSync: boolean;
    /** Session completion ledger */
    ledger?: CompletionLedger;
    /** Error if any */
    error?: Error;
    /** Sync status */
    syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface RecoverPendingSessionsResult {
    /** Number of sessions recovered */
    recovered: number;
    /** Number of sessions that failed to recover */
    failed: number;
    /** Details of recovered sessions */
    recoveredSessions: Array<{
        sessionId: string;
        syncStatus: string;
        recoveredAt: number;
        }>;
    /** Details of failed sessions */
    failedSessions: Array<{
        sessionId: string;
        error: string;
        }>;
}

export interface SessionCompletionHealthCheckResult {
    /** Overall health status */
    status: 'healthy' | 'warning' | 'critical';
    /** Number of pending sessions */
    pendingCount: number;
    /** Age of oldest pending session in minutes */
    oldestPendingAgeMinutes?: number;
    /** Time since last successful sync in minutes */
    minutesSinceLastSync?: number;
    /** Recommendations */
    recommendations: string[];
    /** Is online */
    isOnline: boolean;
}

export interface SessionCompletionSyncMonitorOptions {
    /** Health check interval in milliseconds */
    healthCheckIntervalMs?: number;
    /** Callback for health status changes */
    onHealthStatusChange?: (status: SessionCompletionHealthCheckResult) => void;
}
