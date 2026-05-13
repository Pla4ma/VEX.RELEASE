import { useEffect, useCallback, useRef, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { MMKV } from "react-native-mmkv";
import { useQueryClient } from "@tanstack/react-query";
import * as service from "./service";
import * as repository from "./repository";
import { type CoachMessage, type CoachState } from "./schemas";
import { COACH_QUERY_KEYS } from "./hooks-enhanced";
import { createDebugger } from "../../utils/debug";


export function useOfflineCoach(userId: string): UseOfflineCoachResult {
  const netInfo = useNetInfo();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const processingRef = useRef(false);

  // Update pending count when queue changes
  useEffect(() => {
    const queue = getQueue();
    setPendingCount(queue.length);
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current) {
      return;
    }
    processingRef.current = true;
    setIsProcessing(true);

    const queue = getQueue();
    const remaining: QueuedMutation[] = [];

    for (const mutation of queue) {
      try {
        await processMutation(mutation, userId, queryClient);
      } catch (error) {
        debug.error(
          "Mutation failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        // Retry up to MAX_RETRY_ATTEMPTS
        if (mutation.retryCount < MAX_RETRY_ATTEMPTS) {
          remaining.push({
            ...mutation,
            retryCount: mutation.retryCount + 1,
          });
        }
      }
    }

    saveQueue(remaining);
    setPendingCount(remaining.length);

    processingRef.current = false;
    setIsProcessing(false);
  }, [userId, queryClient]);

  const queueMutation = useCallback(
    (mutation: Omit<QueuedMutation, "id" | "timestamp" | "retryCount">) => {
      const queue = getQueue();

      // Check for duplicate mutations
      const isDuplicate = queue.some(
        (item) =>
          item.type === mutation.type &&
          JSON.stringify(item.payload) === JSON.stringify(mutation.payload),
      );

      if (isDuplicate) {
        debug.debug("[OfflineCoach] Duplicate mutation ignored");
        return;
      }

      // Add to queue
      const newMutation: QueuedMutation = {
        ...mutation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      // Enforce max queue size (FIFO)
      if (queue.length >= MAX_QUEUE_SIZE) {
        queue.shift();
      }

      queue.push(newMutation);
      saveQueue(queue);
      setPendingCount(queue.length);

      // Try to process immediately if online
      if (netInfo.isConnected) {
        processQueue();
      }
    },
    [netInfo.isConnected, processQueue],
  );

  // Process queue when coming back online
  useEffect(() => {
    if (netInfo.isConnected && !processingRef.current) {
      processQueue();
    }
  }, [netInfo.isConnected, netInfo.isInternetReachable, processQueue]);

  const clearQueue = useCallback(() => {
    offlineStorage.delete(QUEUE_KEY);
    setPendingCount(0);
  }, []);

  return {
    isProcessing,
    pendingCount,
    queueMutation,
    processQueue,
    clearQueue,
  };
}

export function useOptimisticCoachAction(
  userId: string,
): UseOptimisticCoachActionResult {
  useOfflineCoach(userId);
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(
    async (
      action: () => Promise<void>,
      optimisticUpdate: () => void,
      rollback: () => void,
    ) => {
      // Apply optimistic update
      optimisticUpdate();

      // Note: Actual offline detection should happen at call site
      // This is a simplified implementation

      // Execute immediately
      setIsPending(true);
      try {
        await action();
      } catch (error) {
        // Rollback on error
        rollback();
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { execute, isPending };
}

export function useOfflineCoachMessageActions(
  userId: string,
  messageId: string,
) {
  const { queueMutation, isProcessing } = useOfflineCoach(userId);
  const queryClient = useQueryClient();

  const markRead = useCallback(async () => {
    // Optimistic update
    queryClient.setQueryData(
      COACH_QUERY_KEYS.messages(userId),
      (old: { pages: Array<{ messages: CoachMessage[] }> } | undefined) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              m.id === messageId ? { ...m, readAt: Date.now() } : m,
            ),
          })),
        };
      },
    );

    // Queue for server sync
    queueMutation({
      type: "MARK_READ",
      payload: { userId, messageId },
    });
  }, [userId, messageId, queueMutation, queryClient]);

  const dismiss = useCallback(async () => {
    // Optimistic update
    queryClient.setQueryData(
      COACH_QUERY_KEYS.messages(userId),
      (old: { pages: Array<{ messages: CoachMessage[] }> } | undefined) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.filter((m) => m.id !== messageId),
          })),
        };
      },
    );

    queueMutation({
      type: "DISMISS",
      payload: { userId, messageId },
    });
  }, [userId, messageId, queueMutation, queryClient]);

  return { markRead, dismiss, isProcessing };
}