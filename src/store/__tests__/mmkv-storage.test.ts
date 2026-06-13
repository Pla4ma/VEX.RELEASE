import { storage } from '../mmkv-storage';

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }

    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }

    delete(key: string): void {
      mockStore.delete(key);
    }

    contains(key: string): boolean {
      return mockStore.has(key);
    }

    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

jest.mock('@/persistence/mmkv-key', () => ({
  getMmkvEncryptionKeySync: () => 'test-encryption-key-32bytes!!',
}));

describe('runtime MMKV storage bridge', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it('persists and reads values through the storage bridge', () => {
    storage.set('feature:key', 'value');

    expect(storage.getString('feature:key')).toBe('value');
    expect(storage.contains('feature:key')).toBe(true);
  });

  it('deletes values without affecting other keys', () => {
    storage.set('feature:key', 'value');
    storage.set('feature:other', 'other');

    storage.delete('feature:key');

    expect(storage.getString('feature:key')).toBeUndefined();
    expect(storage.getString('feature:other')).toBe('other');
  });
});
