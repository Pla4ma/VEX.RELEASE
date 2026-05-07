/**
 * Session Completion Offline Sync Integration
 * 
 * Integrates the offline sync service with the existing session completion
 * workflow to ensure data is never lost.
 */

import { createDebugger } from '../../utils/debug';
import { useNetInfo } from '../../network/useNetInfo';
import { sessionCompletionOfflineSync } from './offline-sync-service';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
} from './schemas';
import { buildCompletionLedger, type BuildCompletionLedgerInput } from './ledger-service';

const debug = createDebugger('session-completion:offline-integration');

// ============================================================================
// Enhanced Session Completion with Offline Sync
// ============================================================================

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

/**
 * Complete a session with robust offline sync support
 */
export async function completeSessionWithOfflineSync(
  input: CompleteSessionWithOfflineSyncInput
): Promise<CompleteSessionWithOfflineSyncResult> {
  const { forceSync = false, syncOptions, ...ledgerInput } = input;

  debug.info('Completing session with offline sync: %s', ledgerInput.sessionId);

  try {
    // Build the completion ledger
    const ledger = buildCompletionLedger(ledgerInput);
    const validated = CompletionLedgerSchema.parse(ledger);

    debug.info('Built completion ledger: %s', validated.ledgerId);

    // Queue for sync with offline support
    const syncResult = await sessionCompletionOfflineSync.queueSessionCompletion(
      validated,
      {
        forceSync,
        ...syncOptions,
      }
    );

    debug.info('Session completion sync result: %o', syncResult);

    return {
      success: true,
      syncedImmediately: syncResult.synced,
      queuedForSync: syncResult.queued,
      ledger: validated,
      syncStatus: syncResult.synced ? 'synced' : 'pending',
      error: syncResult.error,
    };

  } catch (error) {
    debug.error('Failed to complete session with offline sync:', error);

    return {
      success: false,
      syncedImmediately: false,
      queuedForSync: false,
      error: error instanceof Error ? error : new Error(String(error)),
      syncStatus: 'failed',
    };
  }
}

// ============================================================================
// React Hook for Session Completion with Offline Sync
// ============================================================================

export function useCompleteSessionWithOfflineSync() {
  const { isOnline } = useNetInfo();

  return {
    isOnline,
    completeSession: completeSessionWithOfflineSync,
    getSyncStatus: sessionCompletionOfflineSync.getSyncStatus.bind(
      sessionCompletionOfflineSync
    ),
    forceRetryAll: sessionCompletionOfflineSync.forceRetryAll.bind(
      sessionCompletionOfflineSync
    ),
    getDiagnostics: sessionCompletionOfflineSync.getDiagnostics.bind(
      sessionCompletionOfflineSync
    ),
  };
}

// ============================================================================
// Session Completion Recovery Utilities
// ============================================================================

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

/**
 * Attempt to recover all pending session completions
 */
export async function recoverPendingSessions(): Promise<RecoverPendingSessionsResult> {
  debug.info('Starting recovery of pending session completions');

  try {
    const retryResult = await sessionCompletionOfflineSync.forceRetryAll();

    const result: RecoverPendingSessionsResult = {
      recovered: retryResult.successful,
      failed: retryResult.failed,
      recoveredSessions: [], // Would need to be populated by the service
      failedSessions: [], // Would need to be populated by the service
    };

    debug.info('Recovery completed: %o', result);
    return result;

  } catch (error) {
    debug.error('Failed to recover pending sessions:', error);

    return {
      recovered: 0,
      failed: 1,
      recoveredSessions: [],
      failedSessions: [{
        sessionId: 'unknown',
        error: error instanceof Error ? error.message : String(error),
      }],
    };
  }
}

/**
 * Check if there are any pending session completions
 */
export async function hasPendingSessionCompletions(): Promise<boolean> {
  try {
    const diagnostics = sessionCompletionOfflineSync.getDiagnostics();
    return diagnostics.fallbackEntriesCount > 0;
  } catch (error) {
    debug.warn('Failed to check for pending sessions:', error);
    return false;
  }
}

/**
 * Get a summary of pending session completions
 */
export async function getPendingSessionCompletionsSummary(): Promise<{
  count: number;
  oldestEntryAge?: number;
  lastSyncAt: number;
}> {
  try {
    const diagnostics = sessionCompletionOfflineSync.getDiagnostics();
    
    return {
      count: diagnostics.fallbackEntriesCount,
      oldestEntryAge: diagnostics.oldestEntryAge,
      lastSyncAt: diagnostics.lastSyncAt,
    };
  } catch (error) {
    debug.warn('Failed to get pending sessions summary:', error);
    return {
      count: 0,
      lastSyncAt: 0,
    };
  }
}

// ============================================================================
// Session Completion Health Check
// ============================================================================

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

/**
 * Perform health check on session completion sync
 */
export async function performSessionCompletionHealthCheck(): Promise<SessionCompletionHealthCheckResult> {
  const { isOnline } = useNetInfo();
  const diagnostics = sessionCompletionOfflineSync.getDiagnostics();
  
  const now = Date.now();
  const pendingCount = diagnostics.fallbackEntriesCount;
  const oldestAgeMinutes = diagnostics.oldestEntryAge 
    ? Math.floor(diagnostics.oldestEntryAge / (1000 * 60))
    : undefined;
  const minutesSinceLastSync = diagnostics.lastSyncAt
    ? Math.floor((now - diagnostics.lastSyncAt) / (1000 * 60))
    : undefined;

  const recommendations: string[] = [];
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  // Check for critical issues
  if (pendingCount > 10) {
    status = 'critical';
    recommendations.push('High number of pending sessions - check network connectivity');
  } else if (pendingCount > 3) {
    status = 'warning';
    recommendations.push('Several sessions pending sync');
  }

  // Check for old pending sessions
  if (oldestAgeMinutes && oldestAgeMinutes > 60) {
    status = status === 'healthy' ? 'warning' : 'critical';
    recommendations.push('Some sessions have been pending for over an hour');
  } else if (oldestAgeMinutes && oldestAgeMinutes > 15) {
    if (status === 'healthy') {
      status = 'warning';
    }
    recommendations.push('Some sessions have been pending for over 15 minutes');
  }

  // Check last sync time
  if (minutesSinceLastSync && minutesSinceLastSync > 30) {
    status = status === 'healthy' ? 'warning' : 'critical';
    recommendations.push('No successful sync in over 30 minutes');
  }

  // Check connectivity
  if (!isOnline) {
    status = 'critical';
    recommendations.push('Device is offline - session completions will queue');
  }

  // If no issues, add positive recommendation
  if (status === 'healthy') {
    recommendations.push('Session completion sync is operating normally');
  }

  return {
    status,
    pendingCount,
    oldestPendingAgeMinutes: oldestAgeMinutes,
    minutesSinceLastSync,
    recommendations,
    isOnline,
  };
}

// ============================================================================
// Session Completion Sync Monitor
// ============================================================================

export interface SessionCompletionSyncMonitorOptions {
  /** Health check interval in milliseconds */
  healthCheckIntervalMs?: number;
  /** Callback for health status changes */
  onHealthStatusChange?: (status: SessionCompletionHealthCheckResult) => void;
}

export class SessionCompletionSyncMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastHealthStatus: SessionCompletionHealthCheckResult | null = null;
  private options: Required<SessionCompletionSyncMonitorOptions>;

  constructor(options: SessionCompletionSyncMonitorOptions = {}) {
    this.options = {
      healthCheckIntervalMs: options.healthCheckIntervalMs || 60000, // 1 minute
      onHealthStatusChange: options.onHealthStatusChange || (() => {}),
    };
  }

  start(): void {
    if (this.intervalId) {
      this.stop();
    }

    debug.info('Starting session completion sync monitor');

    // Initial health check
    this.performHealthCheck();

    // Start periodic health checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.options.healthCheckIntervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      debug.info('Stopped session completion sync monitor');
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const healthStatus = await performSessionCompletionHealthCheck();
      
      // Notify on status change
      if (!this.lastHealthStatus || 
          healthStatus.status !== this.lastHealthStatus.status ||
          healthStatus.pendingCount !== this.lastHealthStatus.pendingCount) {
        this.options.onHealthStatusChange(healthStatus);
      }

      this.lastHealthStatus = healthStatus;

    } catch (error) {
      debug.error('Health check failed:', error);
    }
  }

  getLastHealthStatus(): SessionCompletionHealthCheckResult | null {
    return this.lastHealthStatus;
  }
}