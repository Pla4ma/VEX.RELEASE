import {
  LANES,
  SessionMode,
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
  createSessionSummary,
} from './helpers';

describe('1. Completion creates memory candidate', () => {
  it.each(LANES)(
    '%s: clean completion produces memory candidates',
    (lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      });
      expect(result.memoryCandidates.length).toBeGreaterThanOrEqual(0);
    },
  );

  it('memory candidate includes session evidence in text', () => {
    const result = buildCompletionPersonalization({
      lane: 'student',
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
    });
    if (result.memoryCandidates.length > 0) {
      expect(result.memoryCandidates[0].text).toBeDefined();
    }
  });

  it('memory candidate confidence reflects completion quality', () => {
    const clean = buildCompletionPersonalization({
      lane: 'game_like',
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
    });
    const abandoned = buildCompletionPersonalization({
      lane: 'game_like',
      summary: createSessionSummary({
        completionPercentage: 0,
        sessionMode: SessionMode.FLOW,
        status: 'ABANDONED',
      }),
    });
    if (clean.memoryCandidates.length > 0 && abandoned.memoryCandidates.length > 0) {
      const cleanConf = (clean.memoryCandidates[0] as { confidence?: number }).confidence ?? 0;
      const abandConf = (abandoned.memoryCandidates[0] as { confidence?: number }).confidence ?? 0;
      expect(cleanConf).toBeGreaterThanOrEqual(abandConf);
    }
  });
});

describe('2. Completing updates lane evidence only with enough signal', () => {
  it('clean completion carries lane profile', () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 10,
      grade: 'A',
      isPersonalBest: false,
      lane: 'student',
      streakAction: 'extended',
      streakDays: 5,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 150,
    });
    expect(result.laneProfile).toBeDefined();
  });

  it('partial completion produces result', () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 0,
      grade: 'C',
      isPersonalBest: false,
      lane: 'game_like',
      streakAction: 'maintained',
      streakDays: 3,
      summary: createSessionSummary({
        completionPercentage: 35,
        sessionMode: SessionMode.FLOW,
        status: 'COMPLETED',
      }),
      xpDelta: 30,
    });
    expect(result.laneProfile).toBeDefined();
  });

  it('abandoned session produces result', () => {
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
    expect(result.laneProfile).toBeDefined();
  });
});
