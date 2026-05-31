import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';

export interface MMKVInstance {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

export const STORAGE_KEYS = {
  activeSession: (userId: string) => `session:active:${userId}`,
  sessionHistory: (userId: string) => `session:history:${userId}`,
  sessionSummaries: (userId: string) => `session:summaries:${userId}`,
  syncQueue: (userId: string) => `session:sync:queue:${userId}`,
};

export class SessionStorageHelper {
  private mmkv: MMKVInstance | null = null;
  private useMMKV = false;

  constructor() {
    this.initStorage();
  }

  private initStorage(): void {
    try {
      const { MMKV } = require('react-native-mmkv');
      this.mmkv = new MMKV({ id: 'session-storage' });
      this.useMMKV = true;
    } catch (error: unknown) {
      this.useMMKV = false;
    }
  }

  async getString(key: string): Promise<string | null> {
    if (this.useMMKV && this.mmkv) {return this.mmkv.getString(key) ?? null;}
    return getMMKVStorageAdapter().getItem(key);
  }

  async setString(key: string, value: string): Promise<void> {
    if (this.useMMKV && this.mmkv) {this.mmkv.set(key, value);}
    else {await getMMKVStorageAdapter().setItem(key, value);}
  }

  async removeString(key: string): Promise<void> {
    if (this.useMMKV && this.mmkv) {this.mmkv.delete(key);}
    else {await getMMKVStorageAdapter().removeItem(key);}
  }
}
