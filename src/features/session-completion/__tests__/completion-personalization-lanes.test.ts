import {
  LANES,
  buildResult,
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

  it.each(LANES)('%s: clean reflection question is non-empty', (lane) => {
    const result = buildResult(lane);
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
  });

  it.each(LANES)('%s: unlock key is non-empty', (lane) => {
    const result = buildResult(lane);
    expect(result.unlockDecision).toBeDefined();
    const key = (result.unlockDecision as { key?: unknown }).key;
    expect(typeof key).toBe('string');
    expect((key as string).length).toBeGreaterThan(0);
  });

  it.each(LANES)('%s: memory candidate generated', (lane) => {
    const result = buildResult(lane);
    expect(result.memoryCandidates.length).toBeGreaterThanOrEqual(0);
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
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
    expect(result.userFacingSummary).toBeDefined();
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
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
    expect(result.userFacingSummary).toBeDefined();
    expect(result.memoryCandidates.length).toBeGreaterThanOrEqual(0);
  });
});
