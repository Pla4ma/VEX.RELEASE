import { getMMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';
import { SprintChainService } from '../SprintChainService';

const mockStores = new Map<string, Map<string, string>>();

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
      this.store.set(key, value);
    }

    delete(key: string): void {
      this.store.delete(key);
    }
  },
}));

jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

describe('SprintChainService persistence', () => {
  beforeEach(() => {
    mockStores.clear();
  });

  it('falls back to the initial state when stored JSON is corrupted', async () => {
    const userId = 'corrupt-user';
    await getMMKVStorageAdapter().setItem(
      `session:sprint-chain:${userId}`,
      '{broken',
    );

    await expect(new SprintChainService().getState(userId)).resolves.toEqual({
      completedCount: 0,
      lastCompletedAt: null,
    });
  });

  it('prevents duplicate completed counts past the chain target', async () => {
    const service = new SprintChainService();
    const userId = 'chain-user';
    const now = Date.now();

    await service.recordSprintCompleted(userId, now);
    await service.recordSprintCompleted(userId, now + 1000);
    await service.recordSprintCompleted(userId, now + 2000);
    const completed = await service.recordSprintCompleted(userId, now + 3000);
    const restored = await service.getState(userId);

    expect(completed.completedCount).toBe(4);
    expect(restored).toEqual({ completedCount: 0, lastCompletedAt: null });
  });
});
