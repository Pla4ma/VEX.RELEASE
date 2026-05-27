import { captureSilentFailure } from "../utils/silent-failure";
/**
 * MMKV Storage Implementation
 *
 * High-performance storage using MMKV.
 */

import type { StorageAdapter, StorageOptions } from "./StorageAdapter";
import type { Nullable } from "../types/global";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("storage:mmkv");

/**
 * MMKV storage adapter
 */
export class MMKVStorage implements StorageAdapter {
  private mmkv: unknown | null = null;
  private options: StorageOptions;
  private initialized = false;

  constructor(options: StorageOptions = {}) {
    this.options = options;
  }

  /**
   * Initialize MMKV instance
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Dynamic import to avoid errors when module not installed
      const MMKV = require("react-native-mmkv").MMKV;

      this.mmkv = new MMKV({
        id: "vex-storage",
        encryptionKey: this.options.encryptionKey,
      });

      this.initialized = true;
    } catch (error) {
      debug.error("Failed to initialize MMKV:", error as Error);
      throw error;
    }
  }

  /**
   * Ensure initialized
   */
  private checkInitialized(): void {
    if (!this.initialized || !this.mmkv) {
      throw new Error("MMKV not initialized. Call initialize() first.");
    }
  }

  async getItem(key: string): Promise<Nullable<string>> {
    this.checkInitialized();
    const value = (
      this.mmkv as { getString: (key: string) => string | undefined }
    ).getString(key);
    return value ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.checkInitialized();
    (this.mmkv as { set: (key: string, value: string) => void }).set(
      key,
      value,
    );
  }

  async removeItem(key: string): Promise<void> {
    this.checkInitialized();
    (this.mmkv as { delete: (key: string) => void }).delete(key);
  }

  async containsKey(key: string): Promise<boolean> {
    this.checkInitialized();
    return (this.mmkv as { contains: (key: string) => boolean }).contains(key);
  }

  async getAllKeys(): Promise<string[]> {
    this.checkInitialized();
    return (this.mmkv as { getAllKeys: () => string[] }).getAllKeys();
  }

  async clear(): Promise<void> {
    this.checkInitialized();
    (this.mmkv as { clearAll: () => void }).clearAll();
  }

  async getSize(): Promise<number> {
    this.checkInitialized();
    return (this.mmkv as { size: number }).size;
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
    if (!json) {
      return null;
    }
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      captureSilentFailure(error, {
        feature: "persistence",
        operation: "safe-fallback",
        type: "data",
      });
      return null;
    }
  }
}

/**
 * Singleton instance
 */
let mmkvInstance: MMKVStorage | null = null;

export function getMMKVStorage(options?: StorageOptions): MMKVStorage {
  if (!mmkvInstance) {
    mmkvInstance = new MMKVStorage(options);
  }
  return mmkvInstance;
}
