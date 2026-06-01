import {
  LANES,
  SessionMode,
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
  createSessionSummary,
} from './helpers';

describe('3. Completion creates next action', () => {
  it('produces nextAction when recommendation service works', () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 10,
      grade: 'A',
      isPersonalBest: false,
      lane: 'student',
      streakAction: 'extended',
      streakDays: 5,
      summary: createSessionSummary({
        createdAt: Date.UTC(2026, 4, 15, 18),
        sessionMode: SessionMode.STUDY,
        userId: '550e8400-e29b-41d4-a716-446655440099',
      }),
      xpDelta: 120,
    });
    expect(result.nextAction).not.toBeNull();
    expect(result.nextAction?.ctaLabel).toBeDefined();
    expect(result.nextAction?.routeParams.presetMode).toBeDefined();
  });

  it('nextAction gracefully nulls when recommendation fails', () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 5,
      grade: 'B',
      isPersonalBest: false,
      lane: 'student',
      streakAction: 'extended',
      streakDays: 2,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      xpDelta: 80,
    });
    expect(result.nextAction).toBeNull();
    expect(result.progressProof.xpDelta).toBe(80);
  });
});

describe('4. Completion asks exactly one question', () => {
  it.each(LANES)(
    '%s: clean completion produces exactly one reflection question',
    (lane) => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 8,
        grade: 'A',
        isPersonalBest: false,
        lane,
        streakAction: 'extended',
        streakDays: 4,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        xpDelta: 120,
      });
      expect(typeof result.reflectionQuestion).toBe('string');
      expect(result.reflectionQuestion.length).toBeGreaterThan(0);
      expect(result.reflectionQuestion.endsWith('?')).toBe(true);

      const questionMarkCount = (result.reflectionQuestion.match(/\?/g) ?? [])
        .length;
      expect(questionMarkCount).toBe(1);
    },
  );

  it('partial uses a recovery question, not an interrogation', () => {
    const result = buildCompletionPersonalization({
      lane: 'student',
      summary: createSessionSummary({ completionPercentage: 40 }),
    });
    expect(result.reflectionQuestion.length).toBeLessThan(80);
    expect(result.reflectionQuestion.endsWith('?')).toBe(true);
  });
});
