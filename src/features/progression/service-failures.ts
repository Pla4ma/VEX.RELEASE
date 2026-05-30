import * as Sentry from "@sentry/react-native";
import { getProgressionServiceConfig } from "./service-config";
import { createProgressionError } from "./service-errors";
import type { EnhancedRepositoryError } from "./repository/enhanced";
import type { AddXpOperationResult } from "./types";

export function handleFetchFailure(
  error: EnhancedRepositoryError | null,
  userId: string,
  breakdown: AddXpOperationResult["breakdown"],
): AddXpOperationResult {
  if (!error) {
    return {
      success: false,
      progression: null,
      xpAdded: 0,
      levelUpOccurred: false,
      previousLevel: 0,
      newLevel: 0,
      breakdown,
      rewards: [],
      error: createProgressionError(
        "UNKNOWN",
        "Failed to create progression",
        false,
      ),
      offlineQueued: false,
    };
  }

  Sentry.captureException(error, {
    tags: { operation: "addXp", phase: "fetch" },
    extra: { userId },
  });

  if (
    getProgressionServiceConfig().enableOfflineQueue &&
    error.code === "NETWORK_ERROR"
  ) {
    return {
      success: false,
      progression: null,
      xpAdded: breakdown.total,
      levelUpOccurred: false,
      previousLevel: 0,
      newLevel: 0,
      breakdown,
      rewards: [],
      error: createProgressionError("NETWORK", error.message, true),
      offlineQueued: true,
    };
  }

  return {
    success: false,
    progression: null,
    xpAdded: 0,
    levelUpOccurred: false,
    previousLevel: 0,
    newLevel: 0,
    breakdown,
    rewards: [],
    error: createProgressionError(
      error.code === "NOT_FOUND" ? "UNKNOWN" : "NETWORK",
      error.message,
      error.isRetryable,
    ),
    offlineQueued: false,
  };
}
