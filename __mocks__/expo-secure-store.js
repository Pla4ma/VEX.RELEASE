/**
 * Jest mock for expo-secure-store
 * Provides a test-friendly in-memory implementation
 */

const storage = new Map();

module.exports = {
  getItemAsync: jest.fn(async (key) => storage.get(key) || null),
  setItemAsync: jest.fn(async (key, value) => { storage.set(key, value); }),
  deleteItemAsync: jest.fn(async (key) => { storage.delete(key); }),
  __resetStorage: () => { storage.clear(); },
};