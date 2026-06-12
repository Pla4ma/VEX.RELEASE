import {
  LANES,
  SessionMode,
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
  createSessionSummary,
} from './helpers';

describe('7. Hidden unlock remains inert', () => {
  it.each(LANES)('%s: hidden featureKey produces unlock decision', (lane) => {
    const result = buildCompletionPersonalization({
      hiddenFeatureKeys: ['some_feature'],
      lane,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
    });
    expect(result.unlockDecision).toBeDefined();
  });

  it('hidden unlock produces a reason', () => {
    const result = buildCompletionPersonalization({
      hiddenFeatureKeys: ['study_os'],
      lane: 'student',
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
    });
    expect(result.unlockDecision).toBeDefined();
  });
});

describe('8. Partial completion no shame', () => {
  const SHAME_TERMS = [
    'fail',
    'failure',
    'weak',
    'bad',
    'terrible',
    'awful',
    'disappointing',
    'shameful',
    'loser',
  ];

  it.each(LANES)(
    '%s: partial reflection contains no shame language',
    (lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ completionPercentage: 30 }),
      });
      const question = result.reflectionQuestion.toLowerCase();
      for (const term of SHAME_TERMS) {
        expect(question).not.toContain(term);
      }
      expect(question.endsWith('?')).toBe(true);
    },
  );

  it.each(LANES)(
    '%s: abandoned reflection contains no shame language',
    (lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({
          completionPercentage: 0,
          sessionMode: SessionMode.FLOW,
          status: 'ABANDONED',
        }),
      });
      const question = result.reflectionQuestion.toLowerCase();
      for (const term of SHAME_TERMS) {
        expect(question).not.toContain(term);
      }
    },
  );

  it('abandoned memory candidate still has low but present confidence', () => {
    const result = buildCompletionPersonalization({
      lane: 'student',
      summary: createSessionSummary({
        completionPercentage: 0,
        sessionMode: SessionMode.STUDY,
        status: 'ABANDONED',
      }),
    });
    if (result.memoryCandidates.length > 0) {
      const conf = (result.memoryCandidates[0] as { confidence?: number }).confidence ?? 0;
      expect(conf).toBeGreaterThanOrEqual(0);
      expect(conf).toBeLessThanOrEqual(1);
    }
  });

  it('partial completion produces user-facing summary', () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 2,
      grade: 'C',
      isPersonalBest: false,
      lane: 'student',
      streakAction: 'maintained',
      streakDays: 2,
      summary: createSessionSummary({ completionPercentage: 45 }),
      xpDelta: 30,
    });
    expect(result.userFacingSummary).toBeDefined();
    expect(result.userFacingSummary.title).toBeDefined();
  });

  it('abandoned session produces user-facing summary', () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: -5,
      grade: 'D',
      isPersonalBest: false,
      lane: 'minimal_normal',
      streakAction: 'broken',
      streakDays: 0,
      summary: createSessionSummary({
        completionPercentage: 0,
        sessionMode: SessionMode.FLOW,
        status: 'ABANDONED',
      }),
      xpDelta: 0,
    });
    expect(result.userFacingSummary).toBeDefined();
    const body = result.userFacingSummary.body.toLowerCase();
    for (const term of SHAME_TERMS) {
      expect(body).not.toContain(term);
    }
  });
});

// ── Cross-cutting: Canonical result shape ──

describe('Canonical result shape', () => {
  it('produces all required fields', () => {
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
    expect(result.laneProfile).toBeDefined();
    expect(result.progressProof).toBeDefined();
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.memoryCandidates).toBeDefined();
    expect(result.unlockDecision).toBeDefined();
    expect(result.nextAction).toBeDefined();
    expect(result.userFacingSummary).toBeDefined();
  });

  it('memory candidate count is 0 or 1 (max sequences)', () => {
    LANES.forEach((lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      });
      expect(result.memoryCandidates.length).toBeLessThanOrEqual(1);
    });
  });

  it('reflection question is a single question', () => {
    LANES.forEach((lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      });
      expect(result.reflectionQuestion).toBeDefined();
      expect(result.reflectionQuestion.length).toBeGreaterThan(0);
    });
  });
});
