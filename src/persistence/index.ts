/**
 * Persistence Layer Export
 */

export type {
  StorageAdapter,
  StorageOptions,
  StorageResult,
} from './StorageAdapter';
export { MMKVStorage, getMMKVStorage } from './MMKVStorage';
export {
  MMKVStorageAdapter,
  getMMKVStorageAdapter,
  getDefaultStorageAdapter,
} from './MMKVStorageAdapter';
export { StorageManager, getStorageManager } from './StorageManager';
export {
  SecureStorage,
  getSecureStorage,
  SecureStorageKeys,
} from './SecureStorage';
export {
  parseJsonWithSchema,
  safeJsonParse,
  stringifyJsonSafe,
} from './safe-json';
export type { SecureStorageKey } from './SecureStorage';
