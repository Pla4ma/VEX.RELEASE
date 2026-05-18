import { SessionCompletionOfflineSyncService } from './offline-sync-service';
import { getNetInfoAdapter } from '../../network/NetInfoAdapter';

export const sessionCompletionOfflineSync = new SessionCompletionOfflineSyncService();
export const offlineSyncService = sessionCompletionOfflineSync;

export function useSessionCompletionOfflineSync(): {
  isOnline: boolean;
  queueSessionCompletion: typeof sessionCompletionOfflineSync.queueSessionCompletion;
  getSyncStatus: typeof sessionCompletionOfflineSync.getSyncStatus;
  forceRetryAll: typeof sessionCompletionOfflineSync.forceRetryAll;
  getDiagnostics: typeof sessionCompletionOfflineSync.getDiagnostics;
} {
  const state = getNetInfoAdapter().getCurrentState();
  return {
    isOnline: state.isConnected && (state.isInternetReachable ?? false),
    queueSessionCompletion: sessionCompletionOfflineSync.queueSessionCompletion.bind(
      sessionCompletionOfflineSync,
    ),
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
