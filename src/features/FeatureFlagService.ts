// Contract: liveops-config/feature-access owns user-visible progressive disclosure.
// This service is limited to remote kill switches, rollouts, and local dev overrides.
import { getStorageManager } from '../persistence/StorageManager';
import type { StorageManager } from '../persistence/StorageManager';
import { eventBus } from '../events/EventBus';
import { createDebugger } from '../utils/debug';
import type { Nullable } from '../types/global';
import { defaultFlags } from './featureFlagDefaults';
import {
  loadFlagsFromStorage,
  loadOverridesFromStorage,
} from './featureFlagStorage';
import {
  fetchAndApplyRemote,
  setFlagOverride,
  clearSingleOverride,
  clearAllOverridesFn,
  updateFlagInStore,
  registerFlagInStore,
  hashString,
} from './featureFlagMutations';
import type { FeatureFlagValue, FeatureFlag, FeatureFlagConfig } from './featureFlagTypes';
import { evaluateFlag, getFlagValue } from './featureFlagEvaluator';

export type { FeatureFlagValue, FeatureFlag, FeatureFlagConfig };
export { getFeatureFlagService } from './featureFlagInstance';
const debug = createDebugger('features');

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
      storageKey: 'vex-feature-flags',
      remoteFetchInterval: 300000,
      enableOverrides: __DEV__,
      ...config,
    };
  }

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {return;}
    await this.storage.initialize();
    this.userId = userId ?? null;
    Object.values(defaultFlags).forEach((flag) => {
      this.flags.set(flag.key, { ...flag });
    });
    await loadFlagsFromStorage(this.storage, this.flags, this.config.storageKey);
    if (this.config.enableOverrides) {
      await loadOverridesFromStorage(this.storage, this.overrides, this.config.storageKey);
    }
    this.startRemoteFetch();
    this.initialized = true;
  }

  private startRemoteFetch(): void {
    this.fetchTimer = setInterval(() => {
      this.fetchRemote().catch((error) => {
        debug.error('Background feature flag fetch failed', error as Error);
      });
    }, this.config.remoteFetchInterval);
  }

  private stopRemoteFetch(): void {
    if (this.fetchTimer) {
      clearInterval(this.fetchTimer);
      this.fetchTimer = null;
    }
  }

  async fetchRemote(): Promise<void> {
    try {
      this.lastFetchAt = await fetchAndApplyRemote(
        this.flags, this.storage, this.config.storageKey, this.lastFetchAt,
      );
      debug.info('Feature flags updated from remote');
    } catch (error) {
      debug.error('Failed to fetch remote feature flags', error as Error);
      eventBus.publish('feature:fetch_failed', {
        error: (error as Error).message,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  isEnabled(key: string): boolean {
    return evaluateFlag(key, this.flags, this.overrides, this.userId ?? null, hashString);
  }

  get<T extends FeatureFlagValue>(key: string, defaultValue: T): T {
    return getFlagValue(key, defaultValue, this.flags, this.overrides, this.userId ?? null, this.isEnabled.bind(this));
  }

  async setOverride(key: string, value: FeatureFlagValue): Promise<void> {
    await setFlagOverride(this.overrides, this.storage, this.config.storageKey, this.config.enableOverrides, key, value);
  }

  async clearOverride(key: string): Promise<void> {
    await clearSingleOverride(this.overrides, this.storage, this.config.storageKey, key);
  }

  async clearAllOverrides(): Promise<void> {
    await clearAllOverridesFn(this.overrides, this.storage, this.config.storageKey);
  }

  getAll(): Record<string, FeatureFlag> {
    return Object.fromEntries(this.flags.entries());
  }

  getEnabled(): string[] {
    return Array.from(this.flags.keys()).filter((key) => this.isEnabled(key));
  }

  async updateFlag(flag: Partial<FeatureFlag> & { key: string }): Promise<void> {
    await updateFlagInStore(this.flags, this.storage, this.config.storageKey, flag);
  }

  async registerFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): Promise<void> {
    await registerFlagInStore(this.flags, this.storage, this.config.storageKey, flag);
  }

  setUserId(userId: string): void { this.userId = userId; }

  cleanup(): void {
    this.stopRemoteFetch();
    this.flags.clear();
    this.overrides.clear();
  }
}
