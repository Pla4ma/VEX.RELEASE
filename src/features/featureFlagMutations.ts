import type { StorageManager } from "../persistence/StorageManager";
import type { FeatureFlag, FeatureFlagValue } from "./FeatureFlagService";
import { eventBus } from "../events";
import {
  saveFlagsToStorage,
  saveOverridesToStorage,
  fetchRemoteFlags,
} from "./featureFlagStorage";

export async function fetchAndApplyRemote(
  flags: Map<string, FeatureFlag>,
  storage: StorageManager,
  storageKey: string,
  lastFetchAt: number,
): Promise<number> {
  const result = await fetchRemoteFlags(
    flags,
    storage,
    storageKey,
    lastFetchAt,
  );
  if (result.hasChanges) {
    await saveFlagsToStorage(storage, flags, storageKey);
  }
  return result.lastFetchAt;
}

export async function setFlagOverride(
  overrides: Map<string, FeatureFlagValue>,
  storage: StorageManager,
  storageKey: string,
  enableOverrides: boolean,
  key: string,
  value: FeatureFlagValue,
): Promise<void> {
  if (!enableOverrides) {
    throw new Error("Overrides are not enabled");
  }
  overrides.set(key, value);
  await saveOverridesToStorage(storage, overrides, storageKey);
  eventBus.publish("feature:override", {
    key,
    value,
    timestamp: Date.now(),
  });
}

export async function clearSingleOverride(
  overrides: Map<string, FeatureFlagValue>,
  storage: StorageManager,
  storageKey: string,
  key: string,
): Promise<void> {
  overrides.delete(key);
  await saveOverridesToStorage(storage, overrides, storageKey);
}

export async function clearAllOverridesFn(
  overrides: Map<string, FeatureFlagValue>,
  storage: StorageManager,
  storageKey: string,
): Promise<void> {
  overrides.clear();
  await saveOverridesToStorage(storage, overrides, storageKey);
}

export async function updateFlagInStore(
  flags: Map<string, FeatureFlag>,
  storage: StorageManager,
  storageKey: string,
  flag: Partial<FeatureFlag> & { key: string },
): Promise<void> {
  const existing = flags.get(flag.key);
  if (!existing) {
    throw new Error(`Flag ${flag.key} does not exist`);
  }
  const updated: FeatureFlag = {
    ...existing,
    ...flag,
    updatedAt: Date.now(),
  };
  flags.set(flag.key, updated);
  await saveFlagsToStorage(storage, flags, storageKey);
  eventBus.publish("feature:updated", {
    key: flag.key,
    oldValue: existing.value,
    newValue: updated.value,
    flag: updated,
  });
}

export async function registerFlagInStore(
  flags: Map<string, FeatureFlag>,
  storage: StorageManager,
  storageKey: string,
  flag: Omit<FeatureFlag, "createdAt" | "updatedAt">,
): Promise<void> {
  const now = Date.now();
  const newFlag: FeatureFlag = { ...flag, createdAt: now, updatedAt: now };
  flags.set(flag.key, newFlag);
  await saveFlagsToStorage(storage, flags, storageKey);
  eventBus.publish("feature:registered", { key: flag.key, flag: newFlag });
}

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}
