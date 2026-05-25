import {
  acceptMemory,
  createMemoryCandidate,
  deleteMemory,
  findMemoriesForRecommendation,
  listActiveMemories,
} from '../service';

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

jest.mock('../../../utils/uuid', () => ({ v4: () => 'memory-id' }));

describe('FocusMemory service', () => {
  const currentTime = 1_780_000_000_000;

  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, 'now').mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates accepted memory from confident completed-session pattern', async () => {
    const memory = await createMemoryCandidate({
      userId: 'user-1',
      type: 'successful_session_pattern',
      summary: 'User completes better with 15-minute study blocks.',
      source: 'session_completion',
      confidence: 0.8,
      createdAt: currentTime,
    });

    expect(memory.accepted).toBe(true);
    expect(await listActiveMemories('user-1')).toHaveLength(1);
  });

  it('keeps abandoned-session memory as candidate when confidence is low', async () => {
    const memory = await createMemoryCandidate({
      userId: 'user-1',
      type: 'failed_session_pattern',
      summary: 'Evening study blocks often abandon.',
      source: 'reflection',
      confidence: 0.4,
      createdAt: currentTime,
    });

    expect(memory.accepted).toBe(false);
    expect(await findMemoriesForRecommendation({ userId: 'user-1', minConfidence: 0.3 })).toHaveLength(0);
  });

  it('accepts, expires, and deletes memories without returning deleted data', async () => {
    const memory = await createMemoryCandidate({
      userId: 'user-1',
      type: 'avoidance_trigger',
      summary: 'Long writing tasks cause avoidance.',
      source: 'reflection',
      confidence: 0.6,
      createdAt: currentTime,
    });

    await acceptMemory(memory.id, 'user-1');
    expect(await findMemoriesForRecommendation({ userId: 'user-1', minConfidence: 0.5 })).toHaveLength(1);
    expect(await findMemoriesForRecommendation({ userId: 'user-1', minConfidence: 0.5, now: currentTime + 31 * 24 * 60 * 60 * 1000 }))
      .toHaveLength(0);
    await deleteMemory(memory.id, 'user-1');
    expect(await listActiveMemories('user-1')).toHaveLength(0);
  });

  it('does not auto-accept imported content memory', async () => {
    const memory = await createMemoryCandidate({
      userId: 'user-1',
      type: 'project_continuity',
      summary: 'Draft stopped at outline section 3.',
      source: 'import',
      confidence: 0.95,
      createdAt: currentTime,
    });

    expect(memory.accepted).toBe(false);
    expect(JSON.stringify(memory)).not.toMatch(/document body|private notes/i);
  });
});
