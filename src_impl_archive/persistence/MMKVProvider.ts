import * as Sentry from '@sentry/react-native';
import type { MMKV } from 'react-native-mmkv';
import type { StorageProvider } from './PersistenceService';

export class MMKVProvider implements StorageProvider {
  private storage: MMKV | null;

  constructor() {
    this.storage = null;
  }

  private async getStorage(): Promise<MMKV> {
    if (!this.storage) {
      const { MMKV } = await import('react-native-mmkv');
      this.storage = new MMKV({
        id: 'vex-persistence',
        encryptionKey: 'vex-encryption-key',
      });
    }
    return this.storage;
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const storage = await this.getStorage();
      const value = storage.getString(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'persistence', operation: 'getItem' },
      });
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    const storage = await this.getStorage();
    storage.set(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    const storage = await this.getStorage();
    storage.delete(key);
  }

  async getAllKeys(): Promise<string[]> {
    const storage = await this.getStorage();
    return [...storage.getAllKeys()];
  }

  async multiGet(keys: string[]): Promise<[string, unknown][]> {
    const results: [string, unknown][] = [];
    for (const key of keys) {
      const value = await this.getItem(key);
      results.push([key, value]);
    }
    return results;
  }

  async multiSet(items: [string, unknown][]): Promise<void> {
    for (const [key, value] of items) {
      await this.setItem(key, value);
    }
  }

  async clear(): Promise<void> {
    const storage = await this.getStorage();
    storage.clearAll();
  }
}
