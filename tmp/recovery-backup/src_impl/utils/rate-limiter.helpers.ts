
import { MMKV } from 'react-native-mmkv';
import { createDebugger } from './debug';

export const debug = createDebugger('rate-limiter');

let _storage: MMKV | null = null;

export function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: 'rate-limiter' });
  }
  return _storage;
}
