import { useEffect, useCallback, useRef, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { type CoachMessage, type CoachState } from '../schemas';
import { COACH_QUERY_KEYS } from '.';
import { createDebugger } from '../../../utils/debug';
import {
  type QueuedMutation,
  type UseOfflineCoachResult,
  type UseOptimisticCoachActionResult,
  MAX_QUEUE_SIZE,
  getQueue,
  saveQueue,
  processMutation,
} from '../session/offline-queue';

const debug = createDebugger('coach:offline');

export function useOfflineCoach(userId: string): UseOfflineCoachResult {
  const netInfo = useNetInfo();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const processingRef = useRef(false);
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
        await processMutation(mutation, userId);
      } catch (error) {
        debug.error(
          'Mutation failed',
          error instanceof Error ? error : new Error(String(error)),
        );
        if (mutation.retryCount < 3) {
          remaining.push({ ...mutation, retryCount: mutation.retryCount + 1 });
        }
      }
    }
    saveQueue(remaining);
    setPendingCount(remaining.length);
    processingRef.current = false;
    setIsProcessing(false);
  }, [userId]);
  const queueMutation = useCallback(
    (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => {
      const queue = getQueue();
      const isDuplicate = queue.some(
        (item) =>
          item.type === mutation.type &&
          JSON.stringify(item.payload) === JSON.stringify(mutation.payload),
      );
      if (isDuplicate) {
        debug.debug('[OfflineCoach] Duplicate mutation ignored');
        return;
      }
      const newMutation: QueuedMutation = {
        ...mutation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };
      if (queue.length >= MAX_QUEUE_SIZE) {
        queue.shift();
      }
      queue.push(newMutation);
      saveQueue(queue);
      setPendingCount(queue.length);
      if (netInfo.isConnected) {
        processQueue();
      }
    },
    [netInfo.isConnected, processQueue],
  );
  useEffect(() => {
    if (netInfo.isConnected && !processingRef.current) {
      processQueue();
    }
  }, [netInfo.isConnected, netInfo.isInternetReachable, processQueue]);
  const clearQueue = useCallback(() => {
    saveQueue([]);
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
      optimisticUpdate();
      setIsPending(true);
      try {
        await action();
      } catch (error) {
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
    queueMutation({ type: 'MARK_READ', payload: { userId, messageId } });
  }, [userId, messageId, queueMutation, queryClient]);
  const dismiss = useCallback(async () => {
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
    queueMutation({ type: 'DISMISS', payload: { userId, messageId } });
  }, [userId, messageId, queueMutation, queryClient]);
  return { markRead, dismiss, isProcessing };
}
export function useOfflinePersonaSelection(userId: string) {
  const { queueMutation, isProcessing } = useOfflineCoach(userId);
  const queryClient = useQueryClient();
  const selectPersona = useCallback(
    async (personaId: string) => {
      queryClient.setQueryData(
        COACH_QUERY_KEYS.state(userId),
        (old: CoachState | undefined) => {
          if (!old) {
            return old;
          }
          return { ...old, personaId };
        },
      );
      queueMutation({ type: 'SELECT_PERSONA', payload: { userId, personaId } });
    },
    [userId, queueMutation, queryClient],
  );
  return { selectPersona, isProcessing };
}
