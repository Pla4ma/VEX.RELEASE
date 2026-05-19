// Contract: liveops-config/feature-access owns user-visible progressive disclosure.
// This service is limited to remote kill switches, rollouts, and local dev overrides.
import { getStorageManager } from "../persistence";
import type { StorageManager } from "../persistence/StorageManager";
import { eventBus } from "../events";
import { createDebugger } from "../utils/debug";
import type { Nullable } from "../types/global";
import { defaultFlags } from "./featureFlagDefaults";
import {
  loadFlagsFromStorage,
  loadOverridesFromStorage,
  startFetchTimer,
} from "./featureFlagStorage";
import {
  fetchAndApplyRemote,
  setFlagOverride,
  clearSingleOverride,
  clearAllOverridesFn,
  updateFlagInStore,
  registerFlagInStore,
  hashString,
} from "./featureFlagMutations";

const debug = createDebugger("features");

export type FeatureFlagValue = boolean | number | string | string[];
export interface FeatureFlag {
  key: string;
  value: FeatureFlagValue;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  requiresAuth: boolean;
  createdAt: number;
  updatedAt: number;
}
export interface FeatureFlagConfig {
  storageKey?: string;
  remoteFetchInterval?: number;
  enableOverrides?: boolean;
}

export class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private overrides: Map<string, FeatureFlagValue> = new Map();
  private storage: StorageManager = getStorageManager();
  private config: Required<FeatureFlagConfig>;
  private initialized = false;
  private userId: Nullable<string> = null;
  private fetchTimer: ReturnType<typeof setInterval> | null = null;
  private lastFetchAt: number = 0;

  constructor(config: FeatureFlagConfig = {}) {
    this.config = {
      storageKey: "vex-feature-flags",
      remoteFetchInterval: 300000,
      enableOverrides: __DEV__,
      ...config,
    };
  }

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {
      return;
    }
    await this.storage.initialize();
    this.userId = userId ?? null;
    Object.values(defaultFlags).forEach((flag) => {
      this.flags.set(flag.key, { ...flag });
    });
    await loadFlagsFromStorage(
      this.storage,
      this.flags,
      this.config.storageKey,
    );
    if (this.config.enableOverrides) {
      await loadOverridesFromStorage(
        this.storage,
        this.overrides,
        this.config.storageKey,
      );
    }
    this.startRemoteFetch();
    this.initialized = true;
  }

  private startRemoteFetch(): void {
    this.fetchTimer = startFetchTimer(
      this.config.remoteFetchInterval,
      () => this.fetchRemote(),
    );
  }

  async fetchRemote(): Promise<void> {
    try {
      this.lastFetchAt = await fetchAndApplyRemote(
        this.flags,
        this.storage,
        this.config.storageKey,
        this.lastFetchAt,
      );
      debug.info("Feature flags updated from remote");
    } catch (error) {
      debug.error("Failed to fetch remote feature flags", error as Error);
      eventBus.publish("feature:fetch_failed", {
        error: (error as Error).message,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  stopRemoteFetch(): void {
    if (this.fetchTimer) {
      clearInterval(this.fetchTimer);
      this.fetchTimer = null;
    }
  }

  isEnabled(key: string): boolean {
    if (this.overrides.has(key)) {
      return Boolean(this.overrides.get(key));
    }
    const flag = this.flags.get(key);
    if (!flag || !flag.enabled) {
      return false;
    }
    if (this.userId) {
      const userHash = hashString(this.userId);
      if (userHash % 100 >= flag.rolloutPercentage) {
        return false;
      }
    } else if (flag.rolloutPercentage < 100) {
      return false;
    }
    return Boolean(flag.value);
  }

  get<T extends FeatureFlagValue>(key: string, defaultValue: T): T {
    if (this.overrides.has(key)) {
      return this.overrides.get(key) as T;
    }
    const flag = this.flags.get(key);
    if (!flag || !flag.enabled || !this.isEnabled(key)) {
      return defaultValue;
    }
    return flag.value as T;
  }

  async setOverride(key: string, value: FeatureFlagValue): Promise<void> {
    await setFlagOverride(
      this.overrides,
      this.storage,
      this.config.storageKey,
      this.config.enableOverrides,
      key,
      value,
    );
  }

  async clearOverride(key: string): Promise<void> {
    await clearSingleOverride(
      this.overrides,
      this.storage,
      this.config.storageKey,
      key,
    );
  }

  async clearAllOverrides(): Promise<void> {
    await clearAllOverridesFn(
      this.overrides,
      this.storage,
      this.config.storageKey,
    );
  }

  getAll(): Record<string, FeatureFlag> {
    return Object.fromEntries(this.flags.entries());
  }

  getEnabled(): string[] {
    return Array.from(this.flags.keys()).filter((key) => this.isEnabled(key));
  }

  async updateFlag(
    flag: Partial<FeatureFlag> & { key: string },
  ): Promise<void> {
    await updateFlagInStore(
      this.flags,
      this.storage,
      this.config.storageKey,
      flag,
    );
  }

  async registerFlag(
    flag: Omit<FeatureFlag, "createdAt" | "updatedAt">,
  ): Promise<void> {
    await registerFlagInStore(
      this.flags,
      this.storage,
      this.config.storageKey,
      flag,
    );
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  cleanup(): void {
    this.stopRemoteFetch();
    this.flags.clear();
    this.overrides.clear();
  }
}

let featureFlagServiceInstance: FeatureFlagService | null = null;

export function getFeatureFlagService(
  config?: FeatureFlagConfig,
): FeatureFlagService {
  if (!featureFlagServiceInstance) {
    featureFlagServiceInstance = new FeatureFlagService(config);
  }
  return featureFlagServiceInstance;
}
