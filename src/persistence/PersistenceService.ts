import { z } from 'zod';
import * as Sentry from '@sentry/react-native';
import { MMKVProvider } from './MMKVProvider';
export interface StorageProvider {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet(keys: string[]): Promise<[string, unknown][]>;
  multiSet(items: [string, unknown][]): Promise<void>;
  clear(): Promise<void>;
}
export type StorageKey =
  | 'boss:phase_states'
  | 'boss:taunt_history'
  | 'premium:subscriptions'
  | 'premium:paywall_history'
  | 'shop:wallets'
  | 'shop:transactions'
  | 'shop:inventories'
  | 'squads:data'
  | 'squads:activity'
  | 'notifications:history'
  | 'notifications:scheduled'
  | 'notifications:preferences'
  | 'onboarding:states'
  | 'onboarding:feature_unlocks'
  | 'analytics:metrics'
  | 'analytics:experiments'
  | 'accessibility:preferences';
export interface PersistenceConfig<T> {
  key: StorageKey;
  schema: z.ZodType<T>;
  encrypted?: boolean;
  ttl?: number;
  version?: number;
}
interface PersistedItem<T> {
  data: T;
  version: number;
  savedAt: number;
  expiresAt?: number;
}
class PersistenceService {
  private primary: MMKVProvider;
  private cache = new Map<string, unknown>();
  constructor() {
    this.primary = new MMKVProvider();
  }
  async get<T>(config: PersistenceConfig<T>): Promise<T | null> {
    const cached = this.cache.get(config.key);
    if (cached !== undefined) {return cached as T;}
    try {
      const item = await this.primary.getItem<PersistedItem<T>>(config.key);
      if (!item) {return null;}
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.remove(config);
        return null;
      }
      const parsed = config.schema.safeParse(item.data);
      if (!parsed.success) {
        Sentry.captureException(parsed.error, {
          tags: { feature: 'persistence', operation: 'validate' },
          extra: { key: config.key },
        });
        return null;
      }
      this.cache.set(config.key, parsed.data);
      return parsed.data;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'persistence', operation: 'get' },
        extra: { key: config.key },
      });
      return null;
    }
  }
  async set<T>(config: PersistenceConfig<T>, data: T): Promise<void> {
    const parsed = config.schema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid data for ${config.key}: ${parsed.error.message}`,
      );
    }
    const item: PersistedItem<T> = {
      data,
      version: config.version ?? 1,
      savedAt: Date.now(),
      expiresAt: config.ttl ? Date.now() + config.ttl : undefined,
    };
    try {
      await this.primary.setItem(config.key, item);
      this.cache.set(config.key, data);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'persistence', operation: 'set' },
        extra: { key: config.key },
      });
      throw error;
    }
  }
  async remove<T>(config: PersistenceConfig<T>): Promise<void> {
    await this.primary.removeItem(config.key);
    this.cache.delete(config.key);
  }
  async multiGet<T extends Record<string, unknown>>(configs: {
    [K in keyof T]: PersistenceConfig<T[K]>;
  }): Promise<{ [K in keyof T]: T[K] | null }> {
    const keys = Object.keys(configs) as (keyof T)[];
    const results = {} as { [K in keyof T]: T[K] | null };
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.get(configs[key]);
      }),
    );
    return results;
  }
  async multiSet<T extends Record<string, unknown>>(
    configs: { [K in keyof T]: PersistenceConfig<T[K]> },
    data: { [K in keyof T]: T[K] },
  ): Promise<void> {
    await Promise.all(
      Object.keys(configs).map(async (key) => {
        await this.set(configs[key as keyof T], data[key as keyof T]);
      }),
    );
  }
  invalidateCache(key: StorageKey): void {
    this.cache.delete(key);
  }
  invalidateAllCache(): void {
    this.cache.clear();
  }
  async migrate<T>(
    config: PersistenceConfig<T>,
    migrationFn: (oldData: unknown, oldVersion: number) => T,
  ): Promise<void> {
    const item = await this.primary.getItem<PersistedItem<unknown>>(config.key);
    if (!item) {return;}
    if (item.version < (config.version ?? 1)) {
      await this.set(config, migrationFn(item.data, item.version));
    }
  }
  async clear(): Promise<void> {
    await this.primary.clear();
    this.cache.clear();
  }
  async getStorageSize(): Promise<number> {
    const keys = await this.primary.getAllKeys();
    let size = 0;
    for (const key of keys) {
      const value = await this.primary.getItem<string>(key);
      if (value) {size += key.length + JSON.stringify(value).length;}
    }
    return size;
  }
}
export const persistence = new PersistenceService();
export { PersistenceConfigs } from './PersistenceConfigs';
export { usePersistence } from './usePersistence';
