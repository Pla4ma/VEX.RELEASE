import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'vex-runtime-storage' });

export const storage = {
  getString: (key: string): string | undefined => mmkv.getString(key),
  set: (key: string, value: string | number | boolean): void => {
    mmkv.set(key, value);
  },
  delete: (key: string): void => {
    mmkv.delete(key);
  },
  contains: (key: string): boolean => mmkv.contains(key),
  getAllKeys: (): string[] => mmkv.getAllKeys(),
};
