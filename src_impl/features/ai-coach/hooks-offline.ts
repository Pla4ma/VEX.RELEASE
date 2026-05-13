/**
 * AI Coach Offline Hooks
 *
 * Offline mutation queue for coach actions
 * Queues mutations when offline, processes when back online
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { MMKV } from "react-native-mmkv";
import { useQueryClient } from "@tanstack/react-query";
import * as service from "./service";
import * as repository from "./repository";
import { type CoachMessage, type CoachState } from "./schemas";
import { COACH_QUERY_KEYS } from "./hooks-enhanced";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("coach:offline");

// ============================================================================
// Offline Queue Storage
// ============================================================================

const offlineStorage = new MMKV({ id: "coach-offline-queue" });

const QUEUE_KEY = "coach_mutation_queue";
const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 3;

interface QueuedMutation {
  id: string;
  type:
    | "MARK_READ"
    | "DISMISS"
    | "TAKE_ACTION"
    | "SELECT_PERSONA"
    | "ACCEPT_RECOMMENDATION";
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
  queueMutation: (
    mutation: Omit<QueuedMutation, "id" | "timestamp" | "retryCount">,
  ) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

// ============================================================================
// Optimistic Hook with Offline Support
// ============================================================================

interface UseOptimisticCoachActionResult {
  execute: (
    action: () => Promise<void>,
    optimisticUpdate: () => void,
    rollback: () => void,
  ) => void;
  isPending: boolean;
}

// ============================================================================
// Specific Offline-Aware Hooks
// ============================================================================
// ============================================================================
// Queue Processing Logic
// ============================================================================

async function processMutation(
  mutation: QueuedMutation,
  userId: string,
  _queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> {
  switch (mutation.type) {
    case "MARK_READ":
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: "MARK_READ",
        metadata: { processedOffline: true },
      });
      break;

    case "DISMISS":
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: "DISMISS",
        metadata: { processedOffline: true },
      });
      break;

    case "TAKE_ACTION":
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: mutation.payload.action as string,
        metadata: { processedOffline: true },
      });
      break;

    case "SELECT_PERSONA":
      await service.updateCoachPreferences({
        userId,
        personaId: mutation.payload.personaId as string,
      });
      break;

    case "ACCEPT_RECOMMENDATION":
      await repository.updateRecommendationStatus(
        mutation.payload.recommendationId as string,
        "ACCEPTED",
      );
      break;

    default:
      debug.warn("[OfflineCoach] Unknown mutation type:", mutation.type);
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

export * from "./hooks-offline.types";
export * from "./hooks-offline.types";
export * from "./hooks-offline.part1";
export * from "./hooks-offline.part2";
