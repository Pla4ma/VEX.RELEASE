import { z } from "zod";
import { createDebugger } from "../../utils/debug";
import { enqueue, type OfflineQueueEntry, type OfflineQueueEntryInput, registerProcessor } from "../../lib/offline/queue";
import { getNetInfoAdapter, type NetworkState } from "../../network/NetInfoAdapter";
import { CompletionLedgerSchema, type CompletionLedger, type CompletionSyncStatus } from "./schemas";
import { createCompletionLedger, updateCompletionSyncStatus, SessionCompletionRepositoryError } from "./repository";


export const sessionCompletionOfflineSync = new SessionCompletionOfflineSyncService();

export const offlineSyncService = sessionCompletionOfflineSync;

export function useSessionCompletionOfflineSync() {
  const adapter = getNetInfoAdapter();
  const state = adapter.getCurrentState();
  const isOnline = state.isConnected && (state.isInternetReachable ?? false);

  return {
    isOnline,
    queueSessionCompletion: sessionCompletionOfflineSync.queueSessionCompletion.bind(
      sessionCompletionOfflineSync
    ),
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