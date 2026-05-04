import { captureSilentFailure } from '../utils/silent-failure';
/**
 * AsyncStorage Adapter
 *
 * Fallback storage using AsyncStorage.
 */

import type { StorageAdapter, StorageOptions } from './StorageAdapter';
import type { Nullable } from '../types/global';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('persistence:asyncstorage');

/**
 * AsyncStorage adapter
 */
export class AsyncStorageAdapter implements StorageAdapter {
  private asyncStorage: unknown | null = null;
  private options: StorageOptions;
  private initialized = false;

  constructor(options: StorageOptions = {}) {
    this.options = options;
  }

  /**
   * Initialize AsyncStorage
   */
  async initialize(): Promise<void> {
    if (this.initialized) {return;}

    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      this.asyncStorage = AsyncStorage;
      this.initialized = true;
    } catch (error) {
      debug.error('Failed to initialize AsyncStorage:', error as Error);
      throw error;
    }
  }

  /**
   * Ensure initialized
   */
  private checkInitialized(): void {
    if (!this.initialized || !this.asyncStorage) {
      throw new Error('AsyncStorage not initialized. Call initialize() first.');
    }
  }

  async getItem(key: string): Promise<Nullable<string>> {
    this.checkInitialized();
    const value = await (this.asyncStorage as { getItem: (key: string) => Promise<string | null> }).getItem(key);
    return value;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.checkInitialized();
    await (this.asyncStorage as { setItem: (key: string, value: string) => Promise<void> }).setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.checkInitialized();
    await (this.asyncStorage as { removeItem: (key: string) => Promise<void> }).removeItem(key);
  }

  async containsKey(key: string): Promise<boolean> {
    this.checkInitialized();
    const keys = await (this.asyncStorage as { getAllKeys: () => Promise<string[]> }).getAllKeys();
    return keys.includes(key);
  }

  async getAllKeys(): Promise<string[]> {
    this.checkInitialized();
    return await (this.asyncStorage as { getAllKeys: () => Promise<string[]> }).getAllKeys();
  }

  async clear(): Promise<void> {
    this.checkInitialized();
    await (this.asyncStorage as { clear: () => Promise<void> }).clear();
  }

  async getSize(): Promise<number> {
    this.checkInitialized();
    const keys = await this.getAllKeys();
    let size = 0;
    for (const key of keys) {
      const value = await this.getItem(key);
      if (value) {
        size += key.length + value.length;
      }
    }
    return size * 2; // Approximate bytes (UTF-16)
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
}

/**
 * Singleton instance
 */
let asyncStorageInstance: AsyncStorageAdapter | null = null;

export function getAsyncStorageAdapter(options?: StorageOptions): AsyncStorageAdapter {
  if (!asyncStorageInstance) {
    asyncStorageInstance = new AsyncStorageAdapter(options);
  }
  return asyncStorageInstance;
}
