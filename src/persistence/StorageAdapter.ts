/**
 * Storage Adapter
 *
 * Abstract storage adapter interface for MMKV and MMKV.
 */

import type { Nullable } from "../types/global";

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  /**
   * Get item from storage
   */
  getItem(key: string): Promise<Nullable<string>>;

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove item from storage
   */
  removeItem(key: string): Promise<void>;

  /**
   * Check if key exists
   */
  containsKey(key: string): Promise<boolean>;

  /**
   * Get all keys
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;

  /**
   * Get storage size in bytes
   */
  getSize(): Promise<number>;
}

/**
 * Storage operation result
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Storage options
 */
export interface StorageOptions {
  encryptionKey?: string;
  enableCompression?: boolean;
  maxSize?: number; // bytes
  ttl?: number; // milliseconds
}
