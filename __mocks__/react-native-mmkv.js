/**
 * Jest mock for react-native-mmkv
 * Provides a test-friendly in-memory implementation matching the v4 API
 * (createMMKV factory + .remove() method).
 */

const storage = new Map();

const createMMKV = () => ({
  id: 'vex-storage',
  encryptionKey: 'test-key',
  getString: jest.fn((key) => storage.get(key)),
  set: jest.fn((key, value) => { storage.set(key, value); }),
  remove: jest.fn((key) => { storage.delete(key); }),
  delete: jest.fn((key) => { storage.delete(key); }),
  contains: jest.fn((key) => storage.has(key)),
  getAllKeys: jest.fn(() => Array.from(storage.keys())),
  clearAll: jest.fn(() => { storage.clear(); }),
  size: 0,
});

let mmkvInstance = null;

module.exports = {
  createMMKV: jest.fn(() => {
    if (!mmkvInstance) {
      mmkvInstance = createMMKV();
    }
    return mmkvInstance;
  }),
  // Backward-compat for any tests that still reference the v3 class
  MMKV: jest.fn(() => {
    if (!mmkvInstance) {
      mmkvInstance = createMMKV();
    }
    return mmkvInstance;
  }),
  __resetStorage: () => {
    storage.clear();
    mmkvInstance = null;
  },
};
