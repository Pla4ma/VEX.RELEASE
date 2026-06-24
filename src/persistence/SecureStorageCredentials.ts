import { captureSilentFailure } from '../utils/silent-failure';
import type { StorageResult } from './StorageAdapter';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('storage');

/**
 * Secure storage credentials interface
 * Provides higher-level credential management with result wrapping
 */
export interface SecureStorageCredentials {
  setCredentials(key: string, value: string): Promise<StorageResult<void>>;
  getCredentials(key: string): Promise<StorageResult<string>>;
  clearCredentials(key: string): Promise<StorageResult<void>>;
}

/**
 * Mixin that adds credential management to a storage adapter
 */
export function createSecureStorageCredentials<
  T extends { setItem: (key: string, value: string) => Promise<void>;
              getItem: (key: string) => Promise<string | null>;
              removeItem: (key: string) => Promise<void> }>(
  storage: T
): SecureStorageCredentials {
  return {
    /**
     * Store credentials securely
     */
    async setCredentials(key: string, value: string): Promise<StorageResult<void>> {
      try {
        await storage.setItem(key, value);
        return { success: true };
      } catch (error) {
        debug.error('[SecureStorage] setCredentials error:', error as Error);
        return { success: false, error: error as Error };
      }
    },

    /**
     * Get credentials securely
     */
    async getCredentials(key: string): Promise<StorageResult<string>> {
      try {
        const value = await storage.getItem(key);
        if (value) {
          return { success: true, data: value };
        }
        return { success: false, error: new Error('No credentials found') };
      } catch (error) {
        debug.error('[SecureStorage] getCredentials error:', error as Error);
        return { success: false, error: error as Error };
      }
    },

    /**
     * Clear credentials
     */
    async clearCredentials(key: string): Promise<StorageResult<void>> {
      try {
        await storage.removeItem(key);
        return { success: true };
      } catch (error) {
        debug.error('[SecureStorage] clearCredentials error:', error as Error);
        return { success: false, error: error as Error };
      }
    },
  };
}