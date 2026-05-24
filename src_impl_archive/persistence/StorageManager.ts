import { captureSilentFailure } from '../utils/silent-failure';
/**
 * Storage Manager
 *
 * Unified storage interface with automatic fallback.
 */

import { MMKVStorage, getMMKVStorage } from './MMKVStorage';
import { getDefaultStorageAdapter } from './MMKVStorageAdapter';
import type { StorageAdapter, StorageOptions } from './StorageAdapter';
import type { Nullable } from '../types/global';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('storage');

/**
 * Storage manager configuration
 */
interface StorageManagerConfig {
  preferMMKV?: boolean;
  options?: StorageOptions;
}

/**
 * Storage manager
 *
 * Provides unified storage with automatic fallback from MMKV to MMKV.
 */
export class StorageManager implements StorageAdapter {
  private primary: StorageAdapter | null = null;
  private fallback: StorageAdapter | null = null;
  private active: StorageAdapter | null = null;
  private config: StorageManagerConfig;
  private useFallback = false;

  constructor(config: StorageManagerConfig = {}) {
    this.config = {
      preferMMKV: true,
      ...config,
    };
  }

  /**
   * Initialize storage
   */
  async initialize(): Promise<void> {
    // Try MMKV first if preferred
    if (this.config.preferMMKV) {
      try {
        const mmkv = getMMKVStorage(this.config.options);
        await mmkv.initialize();
        this.primary = mmkv;
        this.active = mmkv;
        return;
      } catch (error) {
        debug.warn('MMKV initialization failed, falling back to MMKV:', error as Error);
      }
    }

    // Fall back to MMKVStorageAdapter
    try {
      const mmkvAdapter = getDefaultStorageAdapter();
      this.fallback = mmkvAdapter;
      this.active = mmkvAdapter;
      this.useFallback = true;
    } catch (error) {
      debug.error('All storage adapters failed:', error as Error);
      throw error;
    }
  }

  /**
   * Ensure initialized
   */
  private checkInitialized(): void {
    if (!this.active) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
  }

  async getItem(key: string): Promise<Nullable<string>> {
    this.checkInitialized();
    return this.active!.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    this.checkInitialized();
    await this.active!.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.checkInitialized();
    await this.active!.removeItem(key);
  }

  async containsKey(key: string): Promise<boolean> {
    this.checkInitialized();
    return this.active!.containsKey(key);
  }

  async getAllKeys(): Promise<string[]> {
    this.checkInitialized();
    return this.active!.getAllKeys();
  }

  async clear(): Promise<void> {
    this.checkInitialized();
    await this.active!.clear();
  }

  async getSize(): Promise<number> {
    this.checkInitialized();
    return this.active!.getSize();
  }

  /**
   * Set JSON value
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    const json = JSON.stringify(value);
    await this.setItem(key, json);
  }

  /**
   * Get JSON value
   */
  async getJSON<T>(key: string): Promise<Nullable<T>> {
    const json = await this.getItem(key);
    if (!json) {return null;}
    try {
      return JSON.parse(json) as T;
    } catch (error) { captureSilentFailure(error, { feature: 'persistence', operation: 'safe-fallback', type: 'data' });
      return null;
    }
  }

  /**
   * Remove multiple items
   */
  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.removeItem(key)));
  }

  /**
   * Get storage info
   */
  async getInfo(): Promise<{
    adapter: string;
    keys: number;
    size: number;
  }> {
    const keys = await this.getAllKeys();
    const size = await this.getSize();
    return {
      adapter: this.useFallback ? 'MMKVStorageAdapter' : 'MMKV',
      keys: keys.length,
      size,
    };
  }
}

/**
 * Singleton instance
 */
let storageManagerInstance: StorageManager | null = null;

export function getStorageManager(config?: StorageManagerConfig): StorageManager {
  if (!storageManagerInstance) {
    storageManagerInstance = new StorageManager(config);
  }
  return storageManagerInstance;
}

