import { createDebugger } from "../../utils/debug";
import { getNetInfoAdapter } from "../../network/NetInfoAdapter";
import { useNetInfo } from "../../network/useNetInfo";
import { sessionCompletionOfflineSync } from "./offline-sync-service";
import { CompletionLedgerSchema, type CompletionLedger } from "./schemas";
import { buildCompletionLedger, type BuildCompletionLedgerInput } from "./ledger-service";


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

export async function hasPendingSessionCompletions(): Promise<boolean> {
  try {
    const diagnostics = sessionCompletionOfflineSync.getDiagnostics();
    return diagnostics.fallbackEntriesCount > 0;
  } catch (error) {
    debug.warn('Failed to check for pending sessions:', error);
    return false;
  }
}

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

export async function performSessionCompletionHealthCheck(): Promise<SessionCompletionHealthCheckResult> {
  const networkState = getNetInfoAdapter().getCurrentState();
  const isOnline = networkState.isConnected && (networkState.isInternetReachable ?? false);
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