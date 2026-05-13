/**
 * Feature Flag Service
 *
 * Manages feature flags for gradual rollouts and A/B testing.
 */

import { getStorageManager } from '../persistence';
import { eventBus } from '../events';
import { getApiClient } from '../api/client';
import { createDebugger } from '../utils/debug';
import type { Nullable } from '../types/global';

const debug = createDebugger('features');
/**
 * Default feature flags
 */
const defaultFlags: Record<string, FeatureFlag> = {
  'new_design': {
    key: 'new_design',
    value: false,
    description: 'Enable new UI design',
    enabled: true,
    rolloutPercentage: 0,
    requiresAuth: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'dark_mode': {
    key: 'dark_mode',
    value: true,
    description: 'Enable dark mode support',
    enabled: true,
    rolloutPercentage: 100,
    requiresAuth: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'push_notifications': {
    key: 'push_notifications',
    value: true,
    description: 'Enable push notifications',
    enabled: true,
    rolloutPercentage: 100,
    requiresAuth: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'offline_mode': {
    key: 'offline_mode',
    value: false,
    description: 'Enable offline mode',
    enabled: false,
    rolloutPercentage: 0,
    requiresAuth: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'advanced_search': {
    key: 'advanced_search',
    value: false,
    description: 'Enable advanced search filters',
    enabled: true,
    rolloutPercentage: 10,
    requiresAuth: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'beta_features': {
    key: 'beta_features',
    value: false,
    description: 'Enable beta features',
    enabled: true,
    rolloutPercentage: 0,
    requiresAuth: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

/**
 * Feature flag service
 */
export class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private overrides: Map<string, FeatureFlagValue> = new Map();
  private storage = getStorageManager();
  private config: Required<FeatureFlagConfig>;
  private initialized = false;
  private userId: Nullable<string> = null;
  private fetchTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: FeatureFlagConfig = {}) {
    this.config = {
      storageKey: 'vex-feature-flags',
      remoteFetchInterval: 300000, // 5 minutes
      enableOverrides: __DEV__,
      ...config,
    };
  }

  /**
   * Initialize feature flag service
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {return;}

    await this.storage.initialize();
    this.userId = userId ?? null;

    // Load default flags
    Object.values(defaultFlags).forEach((flag) => {
      this.flags.set(flag.key, { ...flag });
    });

    // Load persisted flags
    await this.load();

    // Load overrides
    if (this.config.enableOverrides) {
      await this.loadOverrides();
    }

    // Start remote fetch timer
    this.startRemoteFetch();

    this.initialized = true;
  }

  /**
   * Load flags from storage
   */
  private async load(): Promise<void> {
    try {
      const data = await this.storage.getJSON<Record<string, FeatureFlag>>(
        this.config.storageKey
      );

      if (data) {
        Object.entries(data).forEach(([key, flag]) => {
          this.flags.set(key, flag);
        });
      }
    } catch (error) {
      debug.error('Failed to load feature flags:', error as Error);
    }
  }

  /**
   * Save flags to storage
   */
  private async save(): Promise<void> {
    try {
      const data = Object.fromEntries(this.flags.entries());
      await this.storage.setJSON(this.config.storageKey, data);
    } catch (error) {
      debug.error('Failed to save feature flags:', error as Error);
    }
  }

  /**
   * Load overrides from storage
   */
  private async loadOverrides(): Promise<void> {
    try {
      const data = await this.storage.getJSON<Record<string, FeatureFlagValue>>(
        `${this.config.storageKey}-overrides`
      );

      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          this.overrides.set(key, value);
        });
      }
    } catch (error) {
      debug.error('Failed to load flag overrides:', error as Error);
    }
  }

  /**
   * Save overrides to storage
   */
  private async saveOverrides(): Promise<void> {
    try {
      const data = Object.fromEntries(this.overrides.entries());
      await this.storage.setJSON(`${this.config.storageKey}-overrides`, data);
    } catch (error) {
      debug.error('Failed to save flag overrides:', error as Error);
    }
  }

  /**
   * Start remote fetch timer
   */
  private startRemoteFetch(): void {
    this.fetchTimer = setInterval(() => {
      this.fetchRemote();
    }, this.config.remoteFetchInterval);
  }

  /**
   * Stop remote fetch timer
   */
  stopRemoteFetch(): void {
    if (this.fetchTimer) {
      clearInterval(this.fetchTimer);
      this.fetchTimer = null;
    }
  }

  /**
   * Fetch remote feature flags from API
   */
  async fetchRemote(): Promise<void> {
    if (!this.initialized) {
      debug.warn('Cannot fetch remote flags - not initialized');
      return;
    }

    try {
      debug.debug('Fetching remote feature flags...');

      const api = getApiClient();
      const response = await api.get<Record<string, FeatureFlag>>('/features/flags', {
        deduplicate: true,
        retries: 2,
      });

      const remoteFlags = response.data;
      let hasChanges = false;

      // Merge remote flags with local
      Object.entries(remoteFlags).forEach(([key, remoteFlag]) => {
        const existingFlag = this.flags.get(key);

        if (!existingFlag) {
          // New flag from remote
          this.flags.set(key, {
            ...remoteFlag,
            createdAt: Date.now(),
          });
          hasChanges = true;
          debug.info('New feature flag added: %s', key);
        } else if (remoteFlag.updatedAt > existingFlag.updatedAt) {
          // Remote flag is newer
          this.flags.set(key, {
            ...existingFlag,
            value: remoteFlag.value,
            enabled: remoteFlag.enabled,
            rolloutPercentage: remoteFlag.rolloutPercentage,
            updatedAt: Date.now(),
          });
          hasChanges = true;
          debug.info('Feature flag updated: %s', key);

          // Publish event for flag change
          eventBus.publish('feature:updated', {
            key,
            oldValue: existingFlag.value,
            newValue: remoteFlag.value,
            flag: this.flags.get(key),
          });
        }
      });

      if (hasChanges) {
        await this.save();
        debug.info('Feature flags updated from remote');
      } else {
        debug.debug('No feature flag changes from remote');
      }

      // Update last fetch timestamp
      this.lastFetchAt = Date.now();
    } catch (error) {
      debug.error('Failed to fetch remote feature flags', error as Error);

      // Don't throw - use cached flags
      // But publish an event so UI can show warning if needed
      eventBus.publish('feature:fetch_failed', {
        error: (error as Error).message,
        timestamp: Date.now(),
      });
    }
  }

  private lastFetchAt: number = 0;

  /**
   * Check if feature is enabled
   */
  isEnabled(key: string): boolean {
    // Check override first
    if (this.overrides.has(key)) {
      return Boolean(this.overrides.get(key));
    }

    const flag = this.flags.get(key);

    if (!flag || !flag.enabled) {
      return false;
    }

    // Check rollout percentage
    if (this.userId) {
      const userHash = this.hashString(this.userId);
      const rollout = (userHash % 100) < flag.rolloutPercentage;

      if (!rollout) {
        return false;
      }
    } else if (flag.rolloutPercentage < 100) {
      return false;
    }

    return Boolean(flag.value);
  }

  /**
   * Hash string for consistent rollout
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
  }

  /**
   * Get flag value
   */
  get<T extends FeatureFlagValue>(key: string, defaultValue: T): T {
    // Check override first
    if (this.overrides.has(key)) {
      return this.overrides.get(key) as T;
    }

    const flag = this.flags.get(key);

    if (!flag || !flag.enabled || !this.isEnabled(key)) {
      return defaultValue;
    }

    return flag.value as T;
  }

  /**
   * Set flag value (for overrides in dev)
   */
  async setOverride(key: string, value: FeatureFlagValue): Promise<void> {
    if (!this.config.enableOverrides) {
      throw new Error('Overrides are not enabled');
    }

    this.overrides.set(key, value);
    await this.saveOverrides();

    eventBus.publish('feature:override', {
      key,
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear override
   */
  async clearOverride(key: string): Promise<void> {
    this.overrides.delete(key);
    await this.saveOverrides();
  }

  /**
   * Clear all overrides
   */
  async clearAllOverrides(): Promise<void> {
    this.overrides.clear();
    await this.saveOverrides();
  }

  /**
   * Get all flags
   */
  getAll(): Record<string, FeatureFlag> {
    return Object.fromEntries(this.flags.entries());
  }

  /**
   * Get enabled flags
   */
  getEnabled(): string[] {
    return Array.from(this.flags.keys()).filter((key) => this.isEnabled(key));
  }

  /**
   * Update flag (admin/remote)
   */
  async updateFlag(flag: Partial<FeatureFlag> & { key: string }): Promise<void> {
    const existing = this.flags.get(flag.key);

    if (!existing) {
      throw new Error(`Flag ${flag.key} does not exist`);
    }

    const updated: FeatureFlag = {
      ...existing,
      ...flag,
      updatedAt: Date.now(),
    };

    this.flags.set(flag.key, updated);
    await this.save();

    eventBus.publish('feature:updated', {
      key: flag.key,
      oldValue: existing.value,
      newValue: updated.value,
      flag: updated,
    });
  }

  /**
   * Register new flag
   */
  async registerFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = Date.now();
    const newFlag: FeatureFlag = {
      ...flag,
      createdAt: now,
      updatedAt: now,
    };

    this.flags.set(flag.key, newFlag);
    await this.save();

    eventBus.publish('feature:registered', {
      key: flag.key,
      flag: newFlag,
    });
  }

  /**
   * Set user ID for rollout
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stopRemoteFetch();
    this.flags.clear();
    this.overrides.clear();
  }
}

/**
 * Singleton instance
 */
let featureFlagServiceInstance: FeatureFlagService | null = null;

export function getFeatureFlagService(config?: FeatureFlagConfig): FeatureFlagService {
  if (!featureFlagServiceInstance) {
    featureFlagServiceInstance = new FeatureFlagService(config);
  }
  return featureFlagServiceInstance;
}

export * from "./FeatureFlagService.types";
