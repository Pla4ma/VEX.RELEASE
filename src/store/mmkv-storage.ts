import { getMmkvEncryptionKeySync } from '@/persistence/mmkv-key';
import {
  createRuntimeMMKV,
  type RuntimeMMKV,
} from '@/persistence/mmkv-runtime';

// Lazy singleton — avoids crashing at module load time in Expo Go
// (the shim requires React to be initialized before hook APIs are available)
let _mmkv: RuntimeMMKV | null = null;

function getMMKV(): RuntimeMMKV {
  if (!_mmkv) {
    const encryptionKey = getMmkvEncryptionKeySync();
    _mmkv = createRuntimeMMKV({ id: 'vex-runtime-storage', encryptionKey });
  }
  return _mmkv;
}

export const storage = {
  getString: (key: string): string | undefined => getMMKV().getString(key),
  set: (key: string, value: string | number | boolean): void => {
    getMMKV().set(key, value);
  },
  delete: (key: string): void => {
    getMMKV().delete(key);
  },
  contains: (key: string): boolean => getMMKV().contains(key),
  getAllKeys: (): string[] => getMMKV().getAllKeys(),
};

export const mmkvStorage = {
  getItem: (key: string): string | null => storage.getString(key) ?? null,
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.delete(key);
  },
};
