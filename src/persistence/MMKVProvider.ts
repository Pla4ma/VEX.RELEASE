import * as Sentry from '@sentry/react-native';
import type { StorageProvider } from './PersistenceService';
import { getMmkvEncryptionKey } from './mmkv-key';
import { createRuntimeMMKV, type RuntimeMMKV } from './mmkv-runtime';

export class MMKVProvider implements StorageProvider {
  private storage: RuntimeMMKV | null;

  constructor() {
    this.storage = null;
  }

  private async getStorage(): Promise<RuntimeMMKV> {
    if (!this.storage) {
      const encryptionKey = await getMmkvEncryptionKey();
      this.storage = createRuntimeMMKV({
        id: 'vex-persistence',
        encryptionKey,
      });
    }
    return this.storage;
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const storage = await this.getStorage();
      const value = storage.getString(key);
      if (!value) {return null;}
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
