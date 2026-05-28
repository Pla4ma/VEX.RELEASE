/**
 * Shared test helpers for persistence test suite.
 * Exports the mock storage adapter used across all split test files.
 */

export const mockStorage = {
  data: new Map<string, string>(),
  async setItem(key: string, value: string) {
    this.data.set(key, value);
  },
  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  },
  async removeItem(key: string) {
    this.data.delete(key);
  },
  async getAllKeys(): Promise<string[]> {
    return Array.from(this.data.keys());
  },
  clear() {
    this.data.clear();
  },
};
