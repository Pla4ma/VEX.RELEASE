/**
 * Tests for memory-candidate repository CRUD
 */
import {
  addMemoryCandidate,
  getMemoryCandidates,
  removeMemoryCandidate,
} from '../service';
import { clearMemoryCandidates } from '../repository';

const mockStore = new Map<string, string>();

jest.mock('@store/mmkv-storage', () => ({
  storage: {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    },
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    },
    delete(key: string): void {
      mockStore.delete(key);
    },
    contains(key: string): boolean {
      return mockStore.has(key);
    },
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    },
  },
}));

const userId = 'test-user-mc';

describe('repository CRUD', () => {
  afterEach(() => {
    mockStore.clear();
  });

  it('creates and lists memory candidates', async () => {
    await addMemoryCandidate({
      content: 'Test memory',
      source: 'study_block',
      sourceId: 'block-1',
      userId,
    });
    const list = await getMemoryCandidates(userId);
    expect(list).toHaveLength(1);
    expect(list[0]!.content).toBe('Test memory');
    expect(list[0]!.source).toBe('study_block');
    expect(list[0]!.confidence).toBe('medium');
  });

  it('creates with tags', async () => {
    await addMemoryCandidate({
      content: 'Tagged memory',
      source: 'recall',
      sourceId: 'recall-1',
      tags: ['biology', 'exam'],
      userId,
    });
    const list = await getMemoryCandidates(userId);
    expect(list[0]!.tags).toEqual(['biology', 'exam']);
  });

  it('deleteMemoryCandidate removes by id', async () => {
    await addMemoryCandidate({
      content: 'To delete',
      source: 'study_block',
      sourceId: 'block-2',
      userId,
    });
    const list = await getMemoryCandidates(userId);
    expect(list).toHaveLength(1);
    await removeMemoryCandidate(userId, list[0]!.id);
    const after = await getMemoryCandidates(userId);
    expect(after).toHaveLength(0);
  });

  it('clearMemoryCandidates removes all', async () => {
    for (let i = 0; i < 3; i++) {
      await addMemoryCandidate({
        content: `Memory ${i}`,
        source: 'study_block',
        sourceId: `block-${i}`,
        userId,
      });
    }
    expect((await getMemoryCandidates(userId)).length).toBe(3);
    await clearMemoryCandidates(userId);
    expect((await getMemoryCandidates(userId)).length).toBe(0);
  });

  it('caps at 100 candidates', async () => {
    for (let i = 0; i < 110; i++) {
      await addMemoryCandidate({
        content: `Memory entry ${i}`,
        source: 'study_block',
        sourceId: `block-${i}`,
        userId: 'cap-user',
      });
    }
    const list = await getMemoryCandidates('cap-user');
    expect(list.length).toBeLessThanOrEqual(100);
  });

  it('returns empty array for unknown user', async () => {
    const list = await getMemoryCandidates('unknown-user');
    expect(list).toEqual([]);
  });
});
