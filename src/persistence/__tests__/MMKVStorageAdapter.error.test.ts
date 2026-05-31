import * as Sentry from '@sentry/react-native';
import { MMKVStorageAdapter } from '../MMKVStorageAdapter';

const mockStores = new Map<string, Map<string, string>>();
const mockMmkvControls = {
  throwOnNextSet: false,
  reset: (): void => {
    mockStores.clear();
    mockMmkvControls.throwOnNextSet = false;
  },
};

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    private readonly store: Map<string, string>;

    constructor(options?: { id?: string }) {
      const id = options?.id ?? 'default';
      const existing = mockStores.get(id);
      this.store = existing ?? new Map<string, string>();
      mockStores.set(id, this.store);
    }

    getString(key: string): string | undefined {
      return this.store.get(key);
    }

    set(key: string, value: string): void {
      if (mockMmkvControls.throwOnNextSet) {
        mockMmkvControls.throwOnNextSet = false;
        throw new Error('MMKV write failed');
      }
      this.store.set(key, value);
    }

    delete(key: string): void {
      this.store.delete(key);
    }

    contains(key: string): boolean {
      return this.store.has(key);
    }

    getAllKeys(): string[] {
      return Array.from(this.store.keys());
    }

    clearAll(): void {
      this.store.clear();
    }
  },
}));

describe('MMKVStorageAdapter error paths', () => {
  beforeEach(() => {
    mockMmkvControls.reset();
    jest.clearAllMocks();
  });

  it('returns null when JSON is corrupted and does not throw', async () => {
    const adapter = new MMKVStorageAdapter('corrupt-json');
    await adapter.setItem('payload', '{broken');

    await expect(adapter.getJSON('payload')).resolves.toBeNull();
  });

  it('captures to Sentry when JSON parse fails', async () => {
    const adapter = new MMKVStorageAdapter('capture-json');
    await adapter.setItem('payload', '{broken');

    await adapter.getJSON('payload');

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('returns null when MMKV key does not exist', async () => {
    const adapter = new MMKVStorageAdapter('missing-key');

    await expect(adapter.getJSON('missing')).resolves.toBeNull();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('handles concurrent write and read gracefully', async () => {
    const adapter = new MMKVStorageAdapter('concurrent');

    await Promise.all([
      adapter.setItem('payload', JSON.stringify({ value: 1 })),
      adapter.getJSON('payload'),
    ]);

    await expect(
      adapter.getJSON<{ value: number }>('payload'),
    ).resolves.toEqual({ value: 1 });
  });

  it('recovers on next read after write failure', async () => {
    const adapter = new MMKVStorageAdapter('write-recovery');
    mockMmkvControls.throwOnNextSet = true;

    expect(() =>
      adapter.setItemSync('payload', JSON.stringify({ value: 1 })),
    ).toThrow('MMKV write failed');
    adapter.setItemSync('payload', JSON.stringify({ value: 2 }));

    expect(adapter.getJSONSync<{ value: number }>('payload')).toEqual({
      value: 2,
    });
  });
});
