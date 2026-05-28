import { createDebugger } from "../../utils/debug";
import { useNetInfo } from "../../network/useNetInfo";
import { sessionCompletionOfflineSync } from "./offline-sync-service";
import { CompletionLedgerSchema, type CompletionLedger } from "./schemas";
import {
  buildCompletionLedger,
  type BuildCompletionLedgerInput,
} from "./ledger-service";

const debug = createDebugger("session-completion:offline-integration");

export interface CompleteSessionWithOfflineSyncInput extends BuildCompletionLedgerInput {
  forceSync?: boolean;
  syncOptions?: { maxRetries?: number; skipQueue?: boolean };
}

export interface CompleteSessionWithOfflineSyncResult {
  success: boolean;
  syncedImmediately: boolean;
  queuedForSync: boolean;
  ledger?: CompletionLedger;
  error?: Error;
  syncStatus?: "synced" | "pending" | "failed";
}

export async function completeSessionWithOfflineSync(
  input: CompleteSessionWithOfflineSyncInput,
): Promise<CompleteSessionWithOfflineSyncResult> {
  const { forceSync = false, syncOptions, ...ledgerInput } = input;
  debug.info("Completing session with offline sync: %s", ledgerInput.sessionId);
  try {
    const ledger = buildCompletionLedger(ledgerInput);
    const validated = CompletionLedgerSchema.parse(ledger);
    debug.info("Built completion ledger: %s", validated.ledgerId);
    const syncResult =
      await sessionCompletionOfflineSync.queueSessionCompletion(validated, {
        forceSync,
        ...syncOptions,
      });
    debug.info("Session completion sync result: %o", syncResult);
    return {
      success: true,
      syncedImmediately: syncResult.synced,
      queuedForSync: syncResult.queued,
      ledger: validated,
      syncStatus: syncResult.synced ? "synced" : "pending",
      error: syncResult.error,
    };
  } catch (error) {
    debug.error("Failed to complete session with offline sync:", error);
    return {
      success: false,
      syncedImmediately: false,
      queuedForSync: false,
      error: error instanceof Error ? error : new Error(String(error)),
      syncStatus: "failed",
    };
  }
}

export function useCompleteSessionWithOfflineSync() {
  const { isOnline } = useNetInfo();
  return {
    isOnline,
    completeSession: completeSessionWithOfflineSync,
    getSyncStatus: sessionCompletionOfflineSync.getSyncStatus.bind(
      sessionCompletionOfflineSync,
    ),
    forceRetryAll: sessionCompletionOfflineSync.forceRetryAll.bind(
      sessionCompletionOfflineSync,
    ),
    getDiagnostics: sessionCompletionOfflineSync.getDiagnostics.bind(
      sessionCompletionOfflineSync,
    ),
  };
}

export interface RecoverPendingSessionsResult {
  recovered: number;
  failed: number;
  recoveredSessions: Array<{
    sessionId: string;
    syncStatus: string;
    recoveredAt: number;
  }>;
  failedSessions: Array<{ sessionId: string; error: string }>;
}

export async function recoverPendingSessions(): Promise<RecoverPendingSessionsResult> {
  debug.info("Starting recovery of pending session completions");
  try {
    const retryResult = await sessionCompletionOfflineSync.forceRetryAll();
    const result: RecoverPendingSessionsResult = {
      recovered: retryResult.successful,
      failed: retryResult.failed,
      recoveredSessions: [],
      failedSessions: [],
    };
    debug.info("Recovery completed: %o", result);
    return result;
  } catch (error) {
    debug.error("Failed to recover pending sessions:", error);
    return {
      recovered: 0,
      failed: 1,
      recoveredSessions: [],
      failedSessions: [
        {
          sessionId: "unknown",
          error: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

export async function hasPendingSessionCompletions(): Promise<boolean> {
  try {
    const diagnostics = sessionCompletionOfflineSync.getDiagnostics();
    return diagnostics.fallbackEntriesCount > 0;
  } catch (error) {
    debug.warn("Failed to check for pending sessions:", error);
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
    debug.warn("Failed to get pending sessions summary:", error);
    return { count: 0, lastSyncAt: 0 };
  }
}
