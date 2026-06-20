/**
 * MMKV Storage Adapter
 *
 * Storage adapter using MMKV for React Native.
 * MMKV is a fast key-value storage library developed by Tencent.
 */

import type { Nullable } from '../types/global';
import { safeJsonParse } from './safe-json';
import { getMmkvEncryptionKeySync } from './mmkv-key';
import { configureDebouncedWrites } from '../utils/debounced-write';
import { createRuntimeMMKV, type RuntimeMMKV } from './mmkv-runtime';

// Singleton MMKV instance for Zustand storage
let mmkvStorage: RuntimeMMKV | null = null;

function getStorage(): RuntimeMMKV {
  if (!mmkvStorage) {
    mmkvStorage = createRuntimeMMKV({
      id: 'zustand-storage',
      encryptionKey: getMmkvEncryptionKeySync(),
    });
    configureDebouncedWrites(
      (key, op) => {
        if (op.remove) {mmkvStorage?.delete(key);}
        else {mmkvStorage?.set(key, op.value ?? '');}
      },
      { delay: 100 },
    );
  }
  return mmkvStorage;
}

/**
 * MMKV storage adapter compatible with Zustand's persist middleware
 */
export const getMMKVStorageAdapter = (): MMKVStorageAdapter => {
  return getDefaultStorageAdapter();
};

/**
 * Generic storage adapter interface implementation for MMKV
 */
export class MMKVStorageAdapter {
  private readonly id: string;
  private storage: RuntimeMMKV | null = null;

  constructor(id: string = 'vex-storage') {
    this.id = id;
  }

  private getStorage(): RuntimeMMKV {
    if (!this.storage) {
      this.storage = createRuntimeMMKV({ id: this.id });
    }
    return this.storage;
  }

  async initialize(): Promise<void> {
    this.getStorage();
  }

  async getItem(key: string): Promise<string | null> {
    return this.getStorage().getString(key) ?? null;
  }

  getItemSync(key: string): string | null {
    return this.getStorage().getString(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.getStorage().set(key, value);
  }

  setItemSync(key: string, value: string): void {
    this.getStorage().set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.getStorage().delete(key);
  }

  removeItemSync(key: string): void {
    this.getStorage().delete(key);
  }

  async containsKey(key: string): Promise<boolean> {
    return this.getStorage().contains(key);
  }

  async getAllKeys(): Promise<string[]> {
    return this.getStorage().getAllKeys();
  }

  async clear(): Promise<void> {
    this.getStorage().clearAll();
  }

  async getSize(): Promise<number> {
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

  async getJSON<T>(key: string): Promise<Nullable<T>> {
    const json = await this.getItem(key);
    if (!json) {
      return null;
    }
    return safeJsonParse<T>(json, { feature: 'persistence', key });
  }

  setJSON<T>(key: string, value: T): void {
    const json = JSON.stringify(value);
    this.setItem(key, json);
  }

  getJSONSync<T>(key: string): Nullable<T> {
    const json = this.getItemSync(key);
    if (!json) {
      return null;
    }
    return safeJsonParse<T>(json, { feature: 'persistence', key });
  }

  setJSONSync<T>(key: string, value: T): void {
    this.setItemSync(key, JSON.stringify(value));
  }
}

/**
 * Singleton instance for app-wide use
 */
let adapterInstance: MMKVStorageAdapter | null = null;

export function getDefaultStorageAdapter(): MMKVStorageAdapter {
  if (!adapterInstance) {
    adapterInstance = new MMKVStorageAdapter();
  }
  return adapterInstance;
}
