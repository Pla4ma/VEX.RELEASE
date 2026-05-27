import { MMKV } from "react-native-mmkv";

// Lazy singleton — avoids crashing at module load time in Expo Go
// (the shim requires React to be initialized before hook APIs are available)
let _mmkv: MMKV | null = null;

function getMMKV(): MMKV {
  if (!_mmkv) {
    _mmkv = new MMKV({ id: "vex-runtime-storage" });
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
