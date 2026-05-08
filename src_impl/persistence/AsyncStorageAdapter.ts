import { captureSilentFailure } from '../utils/silent-failure';
/**
 * DEPRECATED: AsyncStorage Adapter
 *
 * ⚠️ VIOLATION: AsyncStorage usage is not allowed per AGENTS.md rules.
 * This file has been replaced with MMKVStorageAdapter.
 * 
 * Use MMKVStorageAdapter instead:
 * import { getDefaultStorageAdapter } from './MMKVStorageAdapter';
 */

import type { StorageAdapter, StorageOptions } from './StorageAdapter';
import type { Nullable } from '../types/global';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('persistence:asyncstorage');

/**
 * DEPRECATED: AsyncStorage adapter - VIOLATES PROJECT RULES
 * 
 * This implementation uses AsyncStorage which is banned by AGENTS.md.
 * Use MMKVStorageAdapter instead for all non-sensitive storage.
 * 
 * @deprecated Use MMKVStorageAdapter from './MMKVStorageAdapter'
 */
export class AsyncStorageAdapter implements StorageAdapter {
  private asyncStorage: unknown | null = null;
  private options: StorageOptions;
  private initialized = false;

  constructor(options: StorageOptions = {}) {
    console.warn('⚠️ AsyncStorageAdapter is DEPRECATED and violates project rules. Use MMKVStorageAdapter instead.');
    this.options = options;
  }

  /**
   * Initialize AsyncStorage
   * @deprecated This should not be used
   */
  async initialize(): Promise<void> {
    if (this.initialized) {return;}

    throw new Error('AsyncStorageAdapter is deprecated and violates project rules. Use MMKVStorageAdapter instead.');
  }

  /**
   * Ensure initialized
   * @deprecated This should not be used
   */
  private checkInitialized(): void {
    if (!this.initialized || !this.asyncStorage) {
      throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
    }
  }

  async getItem(key: string): Promise<Nullable<string>> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }

  async setItem(key: string, value: string): Promise<void> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }

  async removeItem(key: string): Promise<void> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }

  async containsKey(key: string): Promise<boolean> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }

  async getAllKeys(): Promise<string[]> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }

  async clear(): Promise<void> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }

  async getSize(): Promise<number> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }

  /**
   * Set JSON value
   * @deprecated Use MMKVStorageAdapter.setJSON instead
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }

  /**
   * Get JSON value
   * @deprecated Use MMKVStorageAdapter.getJSON instead
   */
  async getJSON<T>(key: string): Promise<Nullable<T>> {
    throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
  }
}

/**
 * DEPRECATED: AsyncStorage singleton
 * @deprecated Use getDefaultStorageAdapter from './MMKVStorageAdapter'
 */
export function getAsyncStorageAdapter(options?: StorageOptions): AsyncStorageAdapter {
  console.warn('⚠️ getAsyncStorageAdapter is DEPRECATED. Use getDefaultStorageAdapter() from MMKVStorageAdapter instead.');
  throw new Error('AsyncStorageAdapter is deprecated. Use MMKVStorageAdapter instead.');
}
