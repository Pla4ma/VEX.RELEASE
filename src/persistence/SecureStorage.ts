import { captureSilentFailure } from '../utils/silent-failure';
/**
 * Secure Storage Adapter
 *
 * Encrypted storage using expo-secure-store for native platforms.
 * Falls back to sessionStorage for web platform.
 * Used for tokens, credentials, and private keys.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Nullable } from '../types/global';
import type { StorageAdapter, StorageResult } from './StorageAdapter';
import { createDebugger } from '../utils/debug';
const debug = createDebugger('storage');
// Web storage prefix to avoid collisions
const WEB_STORAGE_PREFIX = 'vex_secure_';
/**
 * Secure storage adapter implementation
 * Uses expo-secure-store on native, localStorage on web (RB-006 fix)
 */
export class SecureStorage implements StorageAdapter {
  private isWeb: boolean;
  constructor() {
    this.isWeb = Platform.OS === 'web';
  }
  /**
   * Get item from secure storage
   */
  async getItem(key: string): Promise<Nullable<string>> {
    try {
      if (this.isWeb) {
        // Use sessionStorage on web so auth sessions do NOT persist across
        // browser restarts. Session storage clears on tab close, which
        // prevents auth token leakage from unattended browsers.
        return sessionStorage.getItem(WEB_STORAGE_PREFIX + key);
      }
      // Use expo-secure-store on native.
      // keychainAccessible: AfterFirstUnlockThisDeviceOnly prevents auth
      // tokens from being included in iCloud/iTunes backups.
      return await SecureStore.getItemAsync(key, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      debug.error('[SecureStorage] getItem error:', error as Error);
      return null;
    }
  }
  /**
   * Set item in secure storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        // Web data is session-scoped and prefixed to avoid collisions.
        // nosec: B310 - sessionStorage is the securest web storage option
        sessionStorage.setItem(WEB_STORAGE_PREFIX + key, value);
        return;
      }
      // Use expo-secure-store on native
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      debug.error('[SecureStorage] setItem error:', error as Error);
      throw error;
    }
  }
  /**
   * Remove item from secure storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        sessionStorage.removeItem(WEB_STORAGE_PREFIX + key);
        return;
      }
      // Use expo-secure-store on native
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      debug.error('[SecureStorage] removeItem error:', error as Error);
      throw error;
    }
  }
  /**
   * Check if key exists
   */
  async containsKey(key: string): Promise<boolean> {
    try {
      if (this.isWeb) {
        return sessionStorage.getItem(WEB_STORAGE_PREFIX + key) !== null;
      }
      return (await SecureStore.getItemAsync(key, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      })) !== null;
    } catch (error) {
      captureSilentFailure(error, {
        feature: 'persistence',
        operation: 'safe-fallback',
        type: 'data',
      });
      return false;
    }
  }
  /**
   * Get all keys (limited - secure store doesn't expose all keys)
   * Note: SecureStore doesn't support listing keys, this checks known keys
   */
  async getAllKeys(): Promise<string[]> {
    // SecureStore doesn't support listing all keys
    return [];
  }
  /**
   * Clear all storage (limited - must know keys)
   * Note: SecureStore doesn't support clearing all, requires known keys
   */
  async clear(): Promise<void> {
    // SecureStore doesn't support bulk clear
    debug.warn(
      '[SecureStorage] clear() not supported - delete keys individually',
    );
  }
  /**
   * Get storage size (not supported by SecureStore)
   */
  async getSize(): Promise<number> {
    return 0;
  }

}
/**
 * Secure storage singleton
 */
let secureStorage: SecureStorage | null = null;
/**
 * Get secure storage instance
 */
export function getSecureStorage(): SecureStorage {
  if (!secureStorage) {
    secureStorage = new SecureStorage();
  }
  return secureStorage;
}
export { SecureStorageKeys } from './secure-storage-keys';
export type { SecureStorageKey } from './secure-storage-keys';
