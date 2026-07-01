// Credential-specific secure storage methods
// Extracted from SecureStorage.ts for file size compliance
import type { StorageResult } from './StorageAdapter';
import type { SecureStorage } from './SecureStorage';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('storage');

export async function setCredentials(
  storage: SecureStorage,
  key: string,
  value: string,
): Promise<StorageResult<void>> {
  try {
    await storage.setItem(key, value);
    return { success: true };
  } catch (error) {
    debug.error('[SecureStorage] setCredentials error:', error as Error);
    return { success: false, error: error as Error };
  }
}

export async function getCredentials(
  storage: SecureStorage,
  key: string,
): Promise<StorageResult<string>> {
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
}

export async function clearCredentials(
  storage: SecureStorage,
  key: string,
): Promise<StorageResult<void>> {
  try {
    await storage.removeItem(key);
    return { success: true };
  } catch (error) {
    debug.error('[SecureStorage] clearCredentials error:', error as Error);
    return { success: false, error: error as Error };
  }
}
