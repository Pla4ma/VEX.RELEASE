import {
  LANES,
  CLEAN_REFLECTIONS,
  PARTIAL_REFLECTIONS,
  ABANDONED_REFLECTIONS,
  UNLOCK_KEYS,
  buildResult,
  createSessionSummary,
  SessionMode,
} from './helpers';

describe('Completion Personalization — full completion per lane', () => {
  it.each(LANES)('%s: produces all 7 canonical fields', (lane) => {
    const result = buildResult(lane);
    expect(result.laneProfile).toBeDefined();
    expect(result.progressProof).toBeDefined();
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
    expect(result.memoryCandidates).toBeDefined();
    expect(result.unlockDecision).toBeDefined();
    expect(result.userFacingSummary).toBeDefined();
  });

  it.each(LANES)('%s: clean reflection question matches', (lane) => {
    const result = buildResult(lane);
    expect(result.reflectionQuestion).toBe(CLEAN_REFLECTIONS[lane]);
  });

  it.each(LANES)('%s: unlock key matches lane surface', (lane) => {
    const result = buildResult(lane);
    expect(result.unlockDecision.key).toBe(UNLOCK_KEYS[lane]);
  });

  it.each(LANES)('%s: memory candidate generated with evidence', (lane) => {
    const result = buildResult(lane);
    expect(result.memoryCandidates.length).toBe(1);
    expect(result.memoryCandidates[0].text).toContain(
      's:' + createSessionSummary().sessionId.split('-')[0],
    );
  });
});

describe('Completion Personalization — partial completion per lane', () => {
  it.each(LANES)('%s: partial uses recovery question', (lane) => {
    const result = buildResult(lane, {
      grade: 'C',
      summary: {
        completionPercentage: 40,
        sessionMode: SessionMode.FLOW,
        status: 'COMPLETED',
      },
      xpDelta: 50,
      focusScoreDelta: 0,
    });
    expect(result.reflectionQuestion).toBe(PARTIAL_REFLECTIONS[lane]);
    expect(result.userFacingSummary.tone).toBe('info');
  });
});

describe('Completion Personalization — abandoned completion per lane', () => {
  it.each(LANES)('%s: abandoned uses recovery question, no shame', (lane) => {
    const result = buildResult(lane, {
      grade: 'D',
      summary: {
        completionPercentage: 0,
        sessionMode: SessionMode.FLOW,
        status: 'ABANDONED',
        actualDuration: 300,
        effectiveDuration: 200,
        interruptions: 2,
        xpEarned: 10,
      },
      focusScoreDelta: -8,
      xpDelta: 20,
    });
    expect(result.reflectionQuestion).toBe(ABANDONED_REFLECTIONS[lane]);
    expect(result.userFacingSummary.tone).toBe('warning');
    expect(result.memoryCandidates.length).toBe(1);
    expect(result.memoryCandidates[0].confidence).toBeLessThan(0.6);
  });
});
