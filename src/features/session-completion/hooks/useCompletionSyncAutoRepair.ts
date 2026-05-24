import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSessionUIStore } from "../../../store/session-state";
import {
  getNextCompletionSyncState,
  invalidateCompletionReturnUserQueries,
} from "../home-return-sync";

export function useCompletionSyncAutoRepair(input: {
  isOnline: boolean;
  userId: string;
}): void {
  const queryClient = useQueryClient();
  const completionSync = useSessionUIStore((state) => state.completionSync);
  const setCompletionSyncState = useSessionUIStore(
    (state) => state.setCompletionSyncState,
  );

  useEffect(() => {
    if (
      !input.isOnline ||
      !input.userId ||
      completionSync.status !== "pending_sync"
    ) {
      return;
    }

    let cancelled = false;
    invalidateCompletionReturnUserQueries({ queryClient, userId: input.userId })
      .then(() => {
        if (!cancelled) {
          setCompletionSyncState(
            getNextCompletionSyncState({
              current: completionSync,
              failed: false,
              pendingSync: false,
            }),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCompletionSyncState(
            getNextCompletionSyncState({
              current: completionSync,
              failed: true,
              pendingSync: false,
            }),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    completionSync,
    input.isOnline,
    input.userId,
    queryClient,
    setCompletionSyncState,
  ]);
}
