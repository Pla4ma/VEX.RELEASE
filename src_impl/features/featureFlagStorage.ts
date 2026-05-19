import type { StorageManager } from "../persistence/StorageManager";
import type { FeatureFlag, FeatureFlagValue } from "./FeatureFlagService";
import { eventBus } from "../events";
import { getApiClient } from "../api/client";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("features");

export async function loadFlagsFromStorage(
  storage: StorageManager,
  flags: Map<string, FeatureFlag>,
  storageKey: string,
): Promise<void> {
  try {
    const data = await storage.getJSON<Record<string, FeatureFlag>>(storageKey);
    if (data) {
      Object.entries(data).forEach(([key, flag]) => {
        flags.set(key, flag);
      });
    }
  } catch (error) {
    debug.error("Failed to load feature flags:", error as Error);
  }
}

export async function saveFlagsToStorage(
  storage: StorageManager,
  flags: Map<string, FeatureFlag>,
  storageKey: string,
): Promise<void> {
  try {
    const data = Object.fromEntries(flags.entries());
    await storage.setJSON(storageKey, data);
  } catch (error) {
    debug.error("Failed to save feature flags:", error as Error);
  }
}

export async function loadOverridesFromStorage(
  storage: StorageManager,
  overrides: Map<string, FeatureFlagValue>,
  storageKey: string,
): Promise<void> {
  try {
    const data = await storage.getJSON<Record<string, FeatureFlagValue>>(
      `${storageKey}-overrides`,
    );
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        overrides.set(key, value);
      });
    }
  } catch (error) {
    debug.error("Failed to load flag overrides:", error as Error);
  }
}

export async function saveOverridesToStorage(
  storage: StorageManager,
  overrides: Map<string, FeatureFlagValue>,
  storageKey: string,
): Promise<void> {
  try {
    const data = Object.fromEntries(overrides.entries());
    await storage.setJSON(`${storageKey}-overrides`, data);
  } catch (error) {
    debug.error("Failed to save flag overrides:", error as Error);
  }
}

export async function fetchRemoteFlags(
  flags: Map<string, FeatureFlag>,
  storage: StorageManager,
  storageKey: string,
  lastFetchAt: number,
): Promise<{ hasChanges: boolean; lastFetchAt: number }> {
  debug.debug("Fetching remote feature flags...");
  const api = getApiClient();
  const remoteFlags = await api.get<Record<string, FeatureFlag>>(
    "/features/flags",
    { deduplicate: true, retries: 2 },
  );
  let hasChanges = false;
  Object.entries(remoteFlags).forEach(([key, remoteFlag]) => {
    const existingFlag = flags.get(key);
    if (!existingFlag) {
      flags.set(key, {
        ...remoteFlag,
        createdAt: Date.now(),
      });
      hasChanges = true;
      debug.info("New feature flag added: %s", key);
    } else if (remoteFlag.updatedAt > existingFlag.updatedAt) {
      flags.set(key, {
        ...existingFlag,
        value: remoteFlag.value,
        enabled: remoteFlag.enabled,
        rolloutPercentage: remoteFlag.rolloutPercentage,
        updatedAt: Date.now(),
      });
      hasChanges = true;
      debug.info("Feature flag updated: %s", key);
      eventBus.publish("feature:updated", {
        key,
        oldValue: existingFlag.value,
        newValue: remoteFlag.value,
        flag: flags.get(key),
      });
    }
  });
  return { hasChanges, lastFetchAt: Date.now() };
}

export function startFetchTimer(
  intervalMs: number,
  fetcher: () => Promise<void>,
): ReturnType<typeof setInterval> {
  return setInterval(() => {
    void fetcher();
  }, intervalMs);
}
