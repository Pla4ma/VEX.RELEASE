/**
 * MMKV Storage Adapter
 *
 * Storage adapter using MMKV for React Native.
 * MMKV is a fast key-value storage library developed by Tencent.
 */

import { MMKV } from 'react-native-mmkv';
import type { Nullable } from '../types/global';
import { safeJsonParse } from './safe-json';

// Singleton MMKV instance for Zustand storage
let mmkvStorage: MMKV | null = null;

function getStorage(): MMKV {
  if (!mmkvStorage) {
    mmkvStorage = new MMKV({
      id: 'zustand-storage',
    });
  }
  return mmkvStorage;
}

/**
 * MMKV storage adapter compatible with Zustand's persist middleware
 */
export const getMMKVStorageAdapter = () => ({
  getItem: (name: string): Promise<string | null> => {
    const value = getStorage().getString(name);
    return Promise.resolve(value ?? null);
  },
  setItem: (name: string, value: string): Promise<void> => {
    getStorage().set(name, value);
    return Promise.resolve();
  },
  removeItem: (name: string): Promise<void> => {
    getStorage().delete(name);
    return Promise.resolve();
  },
});

/**
 * Generic storage adapter interface implementation for MMKV
 */
export class MMKVStorageAdapter {
  private storage: MMKV;

  constructor(id: string = 'vex-storage') {
    this.storage = new MMKV({ id });
  }

  async getItem(key: string): Promise<Nullable<string>> {
    return this.storage.getString(key) ?? null;
  }

  getItemSync(key: string): Nullable<string> {
    return this.storage.getString(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  setItemSync(key: string, value: string): void {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  removeItemSync(key: string): void {
    this.storage.delete(key);
  }

  async containsKey(key: string): Promise<boolean> {
    return this.storage.contains(key);
  }

  async getAllKeys(): Promise<string[]> {
    return this.storage.getAllKeys();
  }

  async clear(): Promise<void> {
    this.storage.clearAll();
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
