/**
 * Tests for focus-memory memory-operations.ts
 */
import {
  mockStore,
  currentTime,
  createMemoryCandidate,
  listActiveMemories,
  listDeletedMemoryHashes,
  findMemoriesForRecommendation,
  acceptMemory,
  deleteMemory,
  hasEvidenceConflict,
} from './helpers';

describe('focus-memory operations tests', () => {
  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, 'now').mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('listDeletedMemoryHashes', () => {
    it('returns evidence hashes of deleted memories', async () => {
      const m = await createMemoryCandidate({
        userId: 'user-del',
        type: 'best_time_window',
        summary: 'Morning.',
        source: 'behavior',
        confidence: 0.8,
        evidenceHash: 'ev-abc',
        createdAt: currentTime,
      });
      await deleteMemory(m.id, 'user-del');
      const hashes = await listDeletedMemoryHashes('user-del');
      expect(hashes).toContain('ev-abc');
    });

    it('returns empty array when no memories are deleted', async () => {
      await createMemoryCandidate({
        userId: 'user-del2',
        type: 'best_time_window',
        summary: 'Morning.',
        source: 'behavior',
        confidence: 0.8,
        createdAt: currentTime,
      });
      const hashes = await listDeletedMemoryHashes('user-del2');
      expect(hashes).toHaveLength(0);
    });
  });

  describe('hasEvidenceConflict', () => {
    it('returns false for empty evidenceHash', async () => {
      const result = await hasEvidenceConflict('user-ec', '');
      expect(result).toBe(false);
    });

    it('returns true when evidence hash matches a deleted memory', async () => {
      const m = await createMemoryCandidate({
        userId: 'user-ec2',
        type: 'best_time_window',
        summary: 'Pattern.',
        source: 'behavior',
        confidence: 0.7,
        evidenceHash: 'ev-conflict',
        createdAt: currentTime,
      });
      await deleteMemory(m.id, 'user-ec2');
      const result = await hasEvidenceConflict('user-ec2', 'ev-conflict');
      expect(result).toBe(true);
    });

    it('returns false when evidence hash does not match any deleted memory', async () => {
      const result = await hasEvidenceConflict('user-ec3', 'ev-nope');
      expect(result).toBe(false);
    });
  });

  describe('findMemoriesForRecommendation', () => {
    it('filters by type when types array is provided', async () => {
      await createMemoryCandidate({
        userId: 'user-rec',
        type: 'best_time_window',
        summary: 'Morning.',
        source: 'behavior',
        confidence: 0.8,
        createdAt: currentTime,
      });
      await createMemoryCandidate({
        userId: 'user-rec',
        type: 'avoidance_trigger',
        summary: 'Avoid evening.',
        source: 'behavior',
        confidence: 0.8,
        createdAt: currentTime,
      });
      await acceptMemory(
        (
          await listActiveMemories('user-rec')
        )[0]!.id,
        'user-rec',
      );
      await acceptMemory(
        (
          await listActiveMemories('user-rec')
        )[1]!.id,
        'user-rec',
      );

      const result = await findMemoriesForRecommendation({
        userId: 'user-rec',
        types: ['best_time_window'],
      });
      expect(result.every((m) => m.type === 'best_time_window')).toBe(true);
    });

    it('returns only accepted memories', async () => {
      const m = await createMemoryCandidate({
        userId: 'user-acc',
        type: 'best_time_window',
        summary: 'Morning.',
        source: 'behavior',
        confidence: 0.5,
        createdAt: currentTime,
      });
      // not accepted (confidence < 0.7 and not sensitive)
      const result = await findMemoriesForRecommendation({
        userId: 'user-acc',
        minConfidence: 0.3,
      });
      expect(result).toHaveLength(0);

      await acceptMemory(m.id, 'user-acc');
      const result2 = await findMemoriesForRecommendation({
        userId: 'user-acc',
        minConfidence: 0.3,
      });
      expect(result2).toHaveLength(1);
    });
  });
});
