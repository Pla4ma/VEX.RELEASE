import {
  mockStore,
  currentTime,
  createMemoryCandidate,
  listActiveMemories,
  findMemoriesForRecommendation,
  acceptMemory,
  deleteMemory,
  canClaimStrongPattern,
  generateRecommendationEvidence,
  buildColdStartEvidence,
} from './helpers';

describe('FocusMemory — CRUD & evidence', () => {
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

  it('rejects memory Console visibility before 3 sessions', () => {
    expect(canClaimStrongPattern(0)).toBe(false);
    expect(canClaimStrongPattern(1)).toBe(false);
    expect(canClaimStrongPattern(2)).toBe(false);
  });

  it('allows memory Console visibility after 3 sessions', () => {
    expect(canClaimStrongPattern(3)).toBe(true);
    expect(canClaimStrongPattern(10)).toBe(true);
  });

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
});
