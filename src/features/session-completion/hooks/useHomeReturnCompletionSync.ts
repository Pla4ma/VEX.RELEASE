import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useNetInfo } from "../../../network";
import type { SessionSummary } from "../../../session/types";
import { useSessionUIStore } from "../../../store/session-state";
import {
  applyHomeReturnOptimisticUpdate,
  getNextCompletionSyncState,
  invalidateCompletionReturnQueries,
} from "../home-return-sync";

export function useHomeReturnCompletionSync(input: {
  sessionId: string;
  summary: SessionSummary;
  userId: string;
}): () => Promise<void> {
  const queryClient = useQueryClient();
  const { isOnline } = useNetInfo();
  const completionSync = useSessionUIStore((state) => state.completionSync);
  const setCompletionSyncState = useSessionUIStore(
    (state) => state.setCompletionSyncState,
  );

  return useCallback(async (): Promise<void> => {
    if (!input.userId) {
      return;
    }
    const rollback = applyHomeReturnOptimisticUpdate({ ...input, queryClient });
    try {
      await invalidateCompletionReturnQueries({ ...input, queryClient });
      setCompletionSyncState(
        getNextCompletionSyncState({
          current: completionSync,
          failed: false,
          pendingSync: completionSync.status === "pending_sync" && !isOnline,
        }),
      );
    } catch (error: unknown) {
      rollback();
      setCompletionSyncState(
        getNextCompletionSyncState({
          current: completionSync,
          failed: true,
          pendingSync: false,
        }),
      );
    }
  }, [completionSync, input, isOnline, queryClient, setCompletionSyncState]);
}
