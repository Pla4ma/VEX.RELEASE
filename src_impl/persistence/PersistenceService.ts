/**
 * Persistence Service
 *
 * Unified persistence layer for all VEX systems.
 * Provides type-safe storage with MMKV.
 *
 * Features:
 * - Type-safe storage with Zod validation
 * - Automatic encryption for sensitive data
 * - Migration support
 * - Offline queue for pending operations
 * - Cache layer for frequently accessed data
 *
 * Used by:
 * - BossNarrativeSystem (phase states)
 * - PremiumTierSystem (subscriptions)
 * - ShopEconomy (wallets, transactions)
 * - SimplifiedSquadSystem (squads, activity)
 * - SmartNotificationSystem (notification history)
 * - ProgressiveOnboarding (onboarding state)
 */

import { z } from 'zod';
import * as Sentry from '@sentry/react-native';
import type { MMKV } from 'react-native-mmkv';

// ============================================================================
// Storage Provider Interface
// ============================================================================
// ============================================================================
// MMKV Provider (Primary - fast, encrypted)
// ============================================================================

class MMKVProvider implements StorageProvider {
  private storage: MMKV | null; // MMKV instance

  constructor() {
    // Lazy initialization - MMKV imported dynamically
    this.storage = null;
  }

  private async getStorage() {
    if (!this.storage) {
      const { MMKV } = await import('react-native-mmkv');
      this.storage = new MMKV({
        id: 'vex-persistence',
        encryptionKey: 'vex-encryption-key', // Should be securely generated
      });
    }
    return this.storage;
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const storage = await this.getStorage();
      const value = storage.getString(key);
      if (!value) {return null;}
      return JSON.parse(value) as T;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'persistence', operation: 'getItem' },
      });
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    const storage = await this.getStorage();
    storage.set(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    const storage = await this.getStorage();
    storage.delete(key);
  }

  async getAllKeys(): Promise<string[]> {
    const storage = await this.getStorage();
    return [...storage.getAllKeys()];
  }

  async multiGet(keys: string[]): Promise<[string, unknown][]> {
    const results: [string, unknown][] = [];
    for (const key of keys) {
      const value = await this.getItem(key);
      results.push([key, value]);
    }
    return results;
  }

  async multiSet(items: [string, unknown][]): Promise<void> {
    for (const [key, value] of items) {
      await this.setItem(key, value);
    }
  }

  async clear(): Promise<void> {
    const storage = await this.getStorage();
    storage.clearAll();
  }
}

// ============================================================================
// Persistence Service
// ============================================================================

class PersistenceService {
  private primary: MMKVProvider;
  private cache = new Map<string, unknown>();

  constructor() {
    this.primary = new MMKVProvider();
  }

  // ============================================================================
  // Core Operations
  // ============================================================================

  async get<T>(config: PersistenceConfig<T>): Promise<T | null> {
    const cached = this.cache.get(config.key);
    if (cached !== undefined) {
      return cached as T;
    }

    const provider = this.primary;

    try {
      const item = await provider.getItem<PersistedItem<T>>(config.key);

      if (!item) {return null;}

      // Check TTL
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.remove(config);
        return null;
      }

      // Validate with schema
      const parsed = config.schema.safeParse(item.data);
      if (!parsed.success) {
        Sentry.captureException(parsed.error, {
          tags: { feature: 'persistence', operation: 'validate' },
          extra: { key: config.key },
        });
        return null;
      }

      // Cache the result
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
    // Validate before saving
    const parsed = config.schema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid data for ${config.key}: ${parsed.error.message}`);
    }

    const item: PersistedItem<T> = {
      data,
      version: config.version || 1,
      savedAt: Date.now(),
      expiresAt: config.ttl ? Date.now() + config.ttl : undefined,
    };

    const provider = this.primary;

    try {
      await provider.setItem(config.key, item);
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
    const provider = this.primary;
    await provider.removeItem(config.key);
    this.cache.delete(config.key);
  }

  // ============================================================================
  // Batch Operations
  // ============================================================================

  async multiGet<T extends Record<string, unknown>>(
    configs: { [K in keyof T]: PersistenceConfig<T[K]> }
  ): Promise<{ [K in keyof T]: T[K] | null }> {
    const keys = Object.keys(configs) as (keyof T)[];
    const results = {} as { [K in keyof T]: T[K] | null };

    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.get(configs[key]);
      })
    );

    return results;
  }

  async multiSet<T extends Record<string, unknown>>(
    configs: { [K in keyof T]: PersistenceConfig<T[K]> },
    data: { [K in keyof T]: T[K] }
  ): Promise<void> {
    const keys = Object.keys(configs) as (keyof T)[];

    await Promise.all(
      keys.map(async (key) => {
        await this.set(configs[key], data[key]);
      })
    );
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  invalidateCache(key: StorageKey): void {
    this.cache.delete(key);
  }

  invalidateAllCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // Migration Support
  // ============================================================================

  async migrate<T>(
    config: PersistenceConfig<T>,
    migrationFn: (oldData: unknown, oldVersion: number) => T
  ): Promise<void> {
    const provider = this.primary;
    const item = await provider.getItem<PersistedItem<unknown>>(config.key);

    if (!item) {return;}

    if (item.version < (config.version || 1)) {
      const migrated = migrationFn(item.data, item.version);
      await this.set(config, migrated);
    }
  }

  // ============================================================================
  // Utility
  // ============================================================================

  async clear(): Promise<void> {
    const provider = this.primary;
    await provider.clear();
    this.cache.clear();
  }

  async getStorageSize(): Promise<number> {
    const provider = this.primary;
    const keys = await provider.getAllKeys();
    let size = 0;

    for (const key of keys) {
      const value = await provider.getItem<string>(key);
      if (value) {
        size += key.length + JSON.stringify(value).length;
      }
    }

    return size;
  }
}

// ============================================================================
// Predefined Configs
// ============================================================================

// Schema imports - using z.any() for problematic schemas
// ============================================================================
// Singleton Instance
// ============================================================================
// ============================================================================
// React Hook
// ============================================================================
// ============================================================================
// Exports (types already exported above)
// ============================================================================

// Need to import React for the hook
import React from 'react';

export * from "./PersistenceService.types";
export * from "./PersistenceService.part1";
