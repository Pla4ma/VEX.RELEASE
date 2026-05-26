import {
  addMemoryCandidate,
  addMemoryFromRecall,
  addMemoryFromStudyBlock,
  getMemoryCandidates,
  removeMemoryCandidate,
} from '../service';

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined { return mockStore.get(key); }
    set(key: string, value: string | number | boolean): void { mockStore.set(key, String(value)); }
    delete(key: string): void { mockStore.delete(key); }
    contains(key: string): boolean { return mockStore.has(key); }
    getAllKeys(): string[] { return Array.from(mockStore.keys()); }
  },
}));

const userId = 'test-user-mem';

describe('memory-candidate service', function () {
  afterEach(function () {
    mockStore.clear();
  });

  it('creates a memory candidate from study block', async function () {
    const mc = await addMemoryFromStudyBlock({
      blockTitle: 'Cell Structure',
      blockObjective: 'Understand organelles',
      studyBlockId: 'block-1',
      userId,
    });

    expect(mc).not.toBeNull();
    expect(mc?.source).toBe('study_block');
    expect(mc?.content).toContain('Cell Structure');
  });

  it('creates a memory candidate from recall', async function () {
    const mc = await addMemoryFromRecall({
      prompt: 'What is photosynthesis?',
      answerHint: 'Light energy conversion',
      recallId: 'recall-1',
      userId,
    });

    expect(mc).not.toBeNull();
    expect(mc?.source).toBe('recall');
    expect(mc?.content).toContain('photosynthesis');
  });

  it('lists and deletes candidates', async function () {
    await addMemoryCandidate({
      content: 'Test memory keep',
      source: 'study_block',
      sourceId: 'block-1',
      userId,
    });

    const first = await getMemoryCandidates(userId);
    expect(first).toHaveLength(1);

    await removeMemoryCandidate(userId, first[0]!.id);

    const after = await getMemoryCandidates(userId);
    expect(after).toHaveLength(0);
  });

  it('caps at 100 candidates', async function () {
    for (let i = 0; i < 105; i += 1) {
      await addMemoryCandidate({
        content: 'Memory entry ' + String(i),
        source: 'study_block',
        sourceId: 'block-' + String(i),
        userId,
      });
    }

    const list = await getMemoryCandidates(userId);
    expect(list.length).toBeLessThanOrEqual(100);
  });

  it('returns empty list for unknown user', async function () {
    const list = await getMemoryCandidates('unknown-user');
    expect(list).toEqual([]);
  });
});
