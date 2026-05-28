import * as repository from "./repository";
import { withRetry, CircuitBreaker, classifyError } from "../../shared/hardening";
import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import type { SyncState, SyncConflict, SettingCategory } from "./types";
import { resolveConflict } from "./settings-validation";

const syncCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeoutMs: 60000,
  halfOpenMaxCalls: 3,
});

const SYNC_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  retryableErrors: ["network_error", "timeout", "server_error"],
};

export async function syncSettings(
  userId: string,
  options: { force?: boolean; direction?: "up" | "down" | "both" } = {},
): Promise<SyncState> {
  const { force = false, direction = "both" } = options;
  try {
    return await syncCircuitBreaker.execute(async () => {
      const syncState = await repository.fetchSyncState(userId);
      if (!force && syncState?.pendingChanges === 0 && direction !== "down") {
        return {
          userId,
          status: "idle" as const,
          lastSyncAttempt: Date.now(),
          lastSuccessfulSync: syncState.lastSuccessfulSync,
          pendingChanges: 0,
          conflicts: [],
        };
      }
      let conflicts: SyncConflict[] = [];
      if (direction === "up" || direction === "both") {
        const localChanges = await repository.fetchPendingChanges(userId);
        if (localChanges.length > 0) {
          const result = (await withRetry(
            () => repository.pushChanges(userId, localChanges),
            SYNC_RETRY_CONFIG,
          )) as { success: boolean; conflicts: SyncConflict[] };
          conflicts.push(...result.conflicts);
        }
      }
      if (direction === "down" || direction === "both") {
        const remoteChanges = (await withRetry(
          () => repository.fetchRemoteChanges(userId, syncState?.lastSuccessfulSync),
          SYNC_RETRY_CONFIG,
        )) as Array<{
          key: string; value: unknown; category: SettingCategory; timestamp: number;
        }>;
        if (remoteChanges.length > 0) {
          await repository.applyRemoteChanges(userId, remoteChanges);
        }
      }
      if (conflicts.length > 0) {
        for (const conflict of conflicts) {
          await repository.resolveConflict(userId, conflict.id, resolveConflict(conflict));
        }
      }
      const updated: SyncState = {
        userId,
        status: conflicts.length > 0 ? "conflict" : "idle",
        lastSyncAttempt: Date.now(),
        lastSuccessfulSync: Date.now(),
        pendingChanges: 0,
        conflicts,
      };
      await repository.updateSyncState(userId, updated);
      eventBus.publish("network:sync:complete", { synced: 1, failed: conflicts.length });
      return updated;
    });
  } catch (error) {
    const errorInfo = classifyError(error as Error);
    Sentry.captureException(error as Error, {
      tags: { operation: "syncSettings" },
      extra: { userId, direction, errorType: errorInfo.type },
    });
    return {
      userId,
      status: "error",
      lastSyncAttempt: Date.now(),
      pendingChanges: 0,
      conflicts: [],
      errorMessage: error instanceof Error ? error.message : "Sync failed",
    };
  }
}

export { SYNC_RETRY_CONFIG };
