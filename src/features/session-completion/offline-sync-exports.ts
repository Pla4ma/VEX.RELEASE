import { useCallback } from 'react';
import { sessionCompletionOfflineSync } from './offline-sync-service';
import type { CompletionLedger } from './schemas';

export function useSessionCompletionOfflineSync(): {
  queueSessionCompletion: (ledger: CompletionLedger) => Promise<void>;
} {
  return {
    queueSessionCompletion: useCallback(async (ledger: CompletionLedger) => {
      await sessionCompletionOfflineSync.queueSessionCompletion(ledger);
    }, []),
  };
}
