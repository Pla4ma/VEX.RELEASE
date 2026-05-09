/**
 * AI Coach Offline Hooks
 *
 * Offline mutation queue for coach actions
 * Queues mutations when offline, processes when back online
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { MMKV } from 'react-native-mmkv';
import { useQueryClient } from '@tanstack/react-query';
import * as service from './service';
import * as repository from './repository';
import { type CoachMessage, type CoachState } from './schemas';
import { COACH_QUERY_KEYS } from './hooks-enhanced';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('coach:offline');

// ============================================================================
// Offline Queue Storage
// ============================================================================

const offlineStorage = new MMKV({ id: 'coach-offline-queue' });

const QUEUE_KEY = 'coach_mutation_queue';
const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 3;

interface QueuedMutation {
  id: string;
  type: 'MARK_READ' | 'DISMISS' | 'TAKE_ACTION' | 'SELECT_PERSONA' | 'ACCEPT_RECOMMENDATION';
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

// ============================================================================
// Offline Hook
// ============================================================================

interface UseOfflineCoachResult {
  isProcessing: boolean;
  pendingCount: number;
  queueMutation: (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

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

  // Process queue when coming back online
  useEffect(() => {
    if (netInfo.isConnected && !processingRef.current) {
      processQueue();
    }
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  const queueMutation = useCallback(
    (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => {
      const queue = getQueue();

      // Check for duplicate mutations
      const isDuplicate = queue.some((item) => item.type === mutation.type && JSON.stringify(item.payload) === JSON.stringify(mutation.payload));

      if (isDuplicate) {
        debug.debug('[OfflineCoach] Duplicate mutation ignored');
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
    [netInfo.isConnected],
  );

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
        debug.error('Mutation failed', error instanceof Error ? error : new Error(String(error)));

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

// ============================================================================
// Optimistic Hook with Offline Support
// ============================================================================

interface UseOptimisticCoachActionResult {
  execute: (action: () => Promise<void>, optimisticUpdate: () => void, rollback: () => void) => void;
  isPending: boolean;
}

export function useOptimisticCoachAction(userId: string): UseOptimisticCoachActionResult {
  const offlineCoach = useOfflineCoach(userId);
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(
    async (action: () => Promise<void>, optimisticUpdate: () => void, rollback: () => void) => {
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
    [offlineCoach, userId],
  );

  return { execute, isPending };
}

// ============================================================================
// Specific Offline-Aware Hooks
// ============================================================================

export function useOfflineCoachMessageActions(userId: string, messageId: string) {
  const { queueMutation, isProcessing } = useOfflineCoach(userId);
  const queryClient = useQueryClient();

  const markRead = useCallback(async () => {
    // Optimistic update
    queryClient.setQueryData(COACH_QUERY_KEYS.messages(userId), (old: { pages: Array<{ messages: CoachMessage[] }> } | undefined) => {
      if (!old) {
        return old;
      }
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          messages: page.messages.map((m) => (m.id === messageId ? { ...m, readAt: Date.now() } : m)),
        })),
      };
    });

    // Queue for server sync
    queueMutation({
      type: 'MARK_READ',
      payload: { userId, messageId },
    });
  }, [userId, messageId, queueMutation, queryClient]);

  const dismiss = useCallback(async () => {
    // Optimistic update
    queryClient.setQueryData(COACH_QUERY_KEYS.messages(userId), (old: { pages: Array<{ messages: CoachMessage[] }> } | undefined) => {
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
    });

    queueMutation({
      type: 'DISMISS',
      payload: { userId, messageId },
    });
  }, [userId, messageId, queueMutation, queryClient]);

  return { markRead, dismiss, isProcessing };
}

export function useOfflinePersonaSelection(userId: string) {
  const { queueMutation, isProcessing } = useOfflineCoach(userId);
  const queryClient = useQueryClient();

  const selectPersona = useCallback(
    async (personaId: string) => {
      // Optimistic update
      queryClient.setQueryData(COACH_QUERY_KEYS.state(userId), (old: CoachState | undefined) => {
        if (!old) {
          return old;
        }
        return { ...old, personaId };
      });

      queueMutation({
        type: 'SELECT_PERSONA',
        payload: { userId, personaId },
      });
    },
    [userId, queueMutation, queryClient],
  );

  return { selectPersona, isProcessing };
}

// ============================================================================
// Queue Processing Logic
// ============================================================================

async function processMutation(mutation: QueuedMutation, userId: string, queryClient: ReturnType<typeof useQueryClient>): Promise<void> {
  switch (mutation.type) {
    case 'MARK_READ':
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: 'MARK_READ',
        metadata: { processedOffline: true },
      });
      break;

    case 'DISMISS':
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: 'DISMISS',
        metadata: { processedOffline: true },
      });
      break;

    case 'TAKE_ACTION':
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: mutation.payload.action as string,
        metadata: { processedOffline: true },
      });
      break;

    case 'SELECT_PERSONA':
      await service.updateCoachPreferences({
        userId,
        personaId: mutation.payload.personaId as string,
      });
      break;

    case 'ACCEPT_RECOMMENDATION':
      await repository.updateRecommendationStatus(mutation.payload.recommendationId as string, 'ACCEPTED');
      break;

    default:
      debug.warn('[OfflineCoach] Unknown mutation type:', mutation.type);
  }
}

// ============================================================================
// Storage Helpers
// ============================================================================

function getQueue(): QueuedMutation[] {
  const data = offlineStorage.getString(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveQueue(queue: QueuedMutation[]): void {
  offlineStorage.set(QUEUE_KEY, JSON.stringify(queue));
}
