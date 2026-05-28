/**
 * Shared test fixtures for offline-sync-service tests.
 * Extracted to keep test files under the 200-line limit.
 */

import type { CompletionLedger } from "../schemas";
import type { OfflineQueueEntry } from "../../../lib/offline/queue";
import type { NetworkState } from "../../../network/NetInfoAdapter";
import { SessionMode } from "../../../session/modes";

export const mockStorage: Record<string, string> = {};
export const storageKey = "vex_session_completion_fallback";

export const networkState: NetworkState = {
  isConnected: false,
  isInternetReachable: false,
  type: "wifi",
  details: null,
};

export function ledger(
  overrides: Partial<CompletionLedger> = {},
): CompletionLedger {
  return {
    ledgerId: "550e8400-e29b-41d4-a716-446655440002",
    idempotencyKey: "session-complete-1",
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    userId: "550e8400-e29b-41d4-a716-446655440001",
    mode: SessionMode.DEEP_WORK,
    targetDurationSeconds: 1800,
    completedDurationSeconds: 1700,
    effectiveFocusedSeconds: 1600,
    pauseCount: 1,
    interruptionCount: 0,
    strictMode: true,
    startedAt: 1700000000000,
    completedAt: 1700001800000,
    timezone: "UTC",
    grade: "A",
    gradeScore: 94,
    qualityScore: 92,
    focusScoreDelta: 8,
    xpDelta: 120,
    streakResult: { action: "extended", newDays: 3, previousDays: 2 },
    companionReactionId: null,
    rewardIds: ["reward-1"],
    dailyMissionResult: {
      missionId: null,
      progressDelta: 1,
      status: "progressed",
    },
    offlineSyncStatus: "pending_sync",
    degradedSystems: [],
    createdAt: 1700001800000,
    ...overrides,
  };
}

export function queueEntry(payload: CompletionLedger): OfflineQueueEntry {
  return {
    id: "550e8400-e29b-41d4-a716-446655440099",
    operation: "SESSION_COMPLETE",
    feature: "sessions",
    payload,
    idempotencyKey: payload.idempotencyKey,
    createdAt: 1700001800000,
    retryCount: 0,
    maxRetries: 10,
    priority: "high",
  };
}
