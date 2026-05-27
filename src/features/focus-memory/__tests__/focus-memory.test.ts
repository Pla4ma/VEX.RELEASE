import {
  acceptMemory,
  buildColdStartEvidence,
  buildMemoryEvidence,
  canClaimStrongPattern,
  createMemoryCandidate,
  deleteMemory,
  filterImportMemories,
  findMemoriesForRecommendation,
  generateRecommendationEvidence,
  listActiveMemories,
  scopeMessageForSource,
} from '../service';
import { contentScopeForSource } from '../expiry';

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

jest.mock('../../../utils/uuid', () => {
  let counter = 0;
  return { v4: () => `memory-id-${counter++}` };
});

describe('FocusMemory service', () => {
  const currentTime = 1_780_000_000_000;

  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, 'now').mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── existing tests ──

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

  // ── Phase 5 tests ──

  // Test 2: memory Console gating via session-count logic
  it('rejects memory Console visibility before 3 sessions', () => {
    expect(canClaimStrongPattern(0)).toBe(false);
    expect(canClaimStrongPattern(1)).toBe(false);
    expect(canClaimStrongPattern(2)).toBe(false);
  });

  it('allows memory Console visibility after 3 sessions', () => {
    expect(canClaimStrongPattern(3)).toBe(true);
    expect(canClaimStrongPattern(10)).toBe(true);
  });

  // Test 3: recommendation cites memory or cold-start
  it('generates cold-start evidence when sessionCount < 3', () => {
    const evidence = generateRecommendationEvidence([], 2, 'student');
    expect(evidence.fallbackReason).toBe('cold_start');
    expect(evidence.memoryIds).toBeUndefined();
    expect(evidence.source).toBe('cold_start');
    expect(evidence.lane).toBe('student');
  });

  it('generates memory-backed evidence when memories exist and sessionCount >= 3', async () => {
    const memory = await createMemoryCandidate({
      userId: 'user-2',
      type: 'successful_session_pattern',
      summary: 'Morning focus blocks work well.',
      source: 'session_completion',
      confidence: 0.85,
      createdAt: currentTime,
    });
    await acceptMemory(memory.id, 'user-2');
    const memories = await findMemoriesForRecommendation({ userId: 'user-2' });

    const evidence = generateRecommendationEvidence(memories, 5, 'game_like');
    expect(evidence.fallbackReason).toBeUndefined();
    expect(evidence.memoryIds).toContain(memory.id);
    expect(evidence.confidence).toBe(0.85);
    expect(evidence.lane).toBe('game_like');
  });

  it('builds cold-start evidence with explicit reason', () => {
    const evidence = buildColdStartEvidence('insufficient_data', 'minimal_normal');
    expect(evidence.fallbackReason).toBe('insufficient_data');
    expect(evidence.memoryIds).toBeUndefined();
    expect(evidence.source).toBe('cold_start');
  });

  // Test 4: low-confidence memory cannot trigger aggressive claims
  it('filters out low-confidence memories from recommendations', async () => {
    await createMemoryCandidate({
      userId: 'user-3',
      type: 'successful_session_pattern',
      summary: 'Low confidence pattern.',
      source: 'session_completion',
      confidence: 0.3,
      createdAt: currentTime,
    });

    const memories = await findMemoriesForRecommendation({ userId: 'user-3', minConfidence: 0.5 });
    expect(memories).toHaveLength(0);

    const evidence = generateRecommendationEvidence(memories, 5);
    expect(evidence.fallbackReason).toBe('insufficient_data');
  });

  it('empty memories produce insufficient_data fallback', () => {
    const evidence = buildMemoryEvidence([]);
    expect(evidence.fallbackReason).toBe('insufficient_data');
    expect(evidence.memoryIds).toBeUndefined();
  });

  // Test 5: deleted memory not returned (extends existing test)
  it('deleted memory excluded from recommendations', async () => {
    const memory = await createMemoryCandidate({
      userId: 'user-4',
      type: 'best_time_window',
      summary: 'Best at 9am.',
      source: 'behavior',
      confidence: 0.8,
      createdAt: currentTime,
    });
    await acceptMemory(memory.id, 'user-4');
    expect(await findMemoriesForRecommendation({ userId: 'user-4' })).toHaveLength(1);

    await deleteMemory(memory.id, 'user-4');
    expect(await listActiveMemories('user-4')).toHaveLength(0);
    expect(await findMemoriesForRecommendation({ userId: 'user-4' })).toHaveLength(0);
  });

  // Test 6: deleted memory not regenerated from same evidence
  it('prevents re-creation of deleted memory from same evidence hash', async () => {
    const evidenceHash = 'ev-deadbeef';
    await createMemoryCandidate({
      userId: 'user-5',
      type: 'best_time_window',
      summary: 'Best at 10am.',
      source: 'behavior',
      confidence: 0.75,
      evidenceHash,
      createdAt: currentTime,
    });

    const memories = await listActiveMemories('user-5');
    await deleteMemory(memories[0]!.id, 'user-5');

    await expect(
      createMemoryCandidate({
        userId: 'user-5',
        type: 'best_time_window',
        summary: 'Best at 10am.',
        source: 'behavior',
        confidence: 0.75,
        evidenceHash,
        createdAt: currentTime,
      })
    ).rejects.toThrow(/EvidenceConflict/);
  });

  it('allows new memory with distinct evidence hash after deletion', async () => {
    const hash1 = 'ev-abc123';
    const hash2 = 'ev-xyz789';

    const m1 = await createMemoryCandidate({
      userId: 'user-5b',
      type: 'best_time_window',
      summary: 'Morning session works.',
      source: 'behavior',
      confidence: 0.8,
      evidenceHash: hash1,
      createdAt: currentTime,
    });
    await deleteMemory(m1.id, 'user-5b');

    const m2 = await createMemoryCandidate({
      userId: 'user-5b',
      type: 'avoidance_trigger',
      summary: 'Afternoon drag.',
      source: 'behavior',
      confidence: 0.7,
      evidenceHash: hash2,
      createdAt: currentTime,
    });
    expect(m2.id).toBeDefined();
    expect(m2.evidenceHash).toBe(hash2);
  });

  // Test 7: imported study content not used in generic coach copy
  it('scopes imported content messages as task-only', () => {
    const result = scopeMessageForSource('Use spaced repetition for bio exam.', 'import');
    expect(result.scoped).toBe(true);
    expect(result.message).toMatch(/From your content/);
  });

  it('does not scope session_completion messages', () => {
    const result = scopeMessageForSource('You focus better in the morning.', 'session_completion');
    expect(result.scoped).toBe(false);
    expect(result.message).toBe('You focus better in the morning.');
  });

  it('filterImportMemories separates import-sourced from general', async () => {
    const m1 = await createMemoryCandidate({
      userId: 'user-6',
      type: 'project_continuity',
      summary: 'Draft stopped at section 3.',
      source: 'import',
      confidence: 0.9,
      createdAt: currentTime,
    });
    const m2 = await createMemoryCandidate({
      userId: 'user-6',
      type: 'best_time_window',
      summary: 'Best focus at 8am.',
      source: 'behavior',
      confidence: 0.8,
      createdAt: currentTime,
    });

    await acceptMemory(m1.id, 'user-6');
    await acceptMemory(m2.id, 'user-6');

    const all = await listActiveMemories('user-6');
    const { taskScoped, excluded } = filterImportMemories(all);

    expect(taskScoped).toHaveLength(1);
    expect(taskScoped[0]!.source).toBe('behavior');
    expect(excluded).toHaveLength(1);
    expect(excluded[0]!.source).toBe('import');
  });

  it('contentScopeForSource returns task_only for import source', () => {
    expect(contentScopeForSource('import')).toBe('task_only');
    expect(contentScopeForSource('session_completion')).toBe('general');
    expect(contentScopeForSource('behavior')).toBe('general');
    expect(contentScopeForSource('reflection')).toBe('general');
    expect(contentScopeForSource('manual')).toBe('general');
  });

  // Test 8: partial profile fallback safe
  it('buildColdStartEvidence handles all valid reasons', () => {
    expect(buildColdStartEvidence('cold_start').fallbackReason).toBe('cold_start');
    expect(buildColdStartEvidence('insufficient_data').fallbackReason).toBe('insufficient_data');
    expect(buildColdStartEvidence('user_override').fallbackReason).toBe('user_override');
  });

  it('generateRecommendationEvidence with explicit fallback reason', () => {
    const evidence = generateRecommendationEvidence([], 5, 'deep_creative', 'user_override');
    expect(evidence.fallbackReason).toBe('user_override');
    expect(evidence.memoryIds).toBeUndefined();
    expect(evidence.lane).toBe('deep_creative');
  });

  it('buildMemoryEvidence with multiple memories computes avg confidence', async () => {
    const m1 = await createMemoryCandidate({
      userId: 'user-7',
      type: 'successful_session_pattern',
      summary: 'Pattern A.',
      source: 'session_completion',
      confidence: 0.6,
      createdAt: currentTime,
    });
    const m2 = await createMemoryCandidate({
      userId: 'user-7',
      type: 'successful_session_pattern',
      summary: 'Pattern B.',
      source: 'session_completion',
      confidence: 0.8,
      createdAt: currentTime,
    });
    await acceptMemory(m1.id, 'user-7');
    await acceptMemory(m2.id, 'user-7');

    const memories = await findMemoriesForRecommendation({ userId: 'user-7' });
    const evidence = buildMemoryEvidence(memories);
    expect(evidence.confidence).toBe(0.7);
    expect(evidence.memoryIds).toHaveLength(2);
    expect(evidence.evidenceSummary).toContain('Pattern A.');
    expect(evidence.evidenceSummary).toContain('Pattern B.');
  });
});
