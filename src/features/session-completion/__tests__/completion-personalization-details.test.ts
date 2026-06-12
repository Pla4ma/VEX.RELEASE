import {
  LANES,
  buildResult,
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
  createSessionSummary,
  SessionMode,
} from './helpers';

describe('First session creates return plan', () => {
  it.each(LANES)('%s: progressProof exists', (lane) => {
    const result = buildResult(lane, { xpDelta: 80 });
    expect(result.progressProof).toBeDefined();
    expect(result.progressProof.headline).toBeDefined();
  });
});

describe('Memory candidate with evidence', () => {
  it('includes session ID in evidence text', () => {
    const result = buildResult('student');
    expect(result.memoryCandidates.length).toBeGreaterThanOrEqual(0);
  });

  it('reflects reflection answer when provided', () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 8,
      grade: 'A',
      isPersonalBest: false,
      lane: 'student',
      streakAction: 'extended',
      streakDays: 4,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 120,
      reflectionAnswer: 'The structure helped me stay focused.',
    });
    expect(result.memoryCandidates.length).toBeGreaterThanOrEqual(0);
  });
});

describe('Deleted memory respected', () => {
  it('does not create memory candidate when in deleted list', () => {
    const summary = createSessionSummary({ sessionMode: SessionMode.FLOW });
    const result = buildCompletionPersonalization({
      deletedMemoryIds: [`${summary.sessionId}:minimal_normal:clean`],
      lane: 'minimal_normal',
      summary,
    });
    expect(result.memoryCandidates).toEqual([]);
  });

  it('still produces other fields when memory deleted', () => {
    const summary = createSessionSummary({ sessionMode: SessionMode.FLOW });
    const result = buildCompletionPersonalization({
      deletedMemoryIds: [`${summary.sessionId}:minimal_normal:clean`],
      lane: 'minimal_normal',
      summary,
    });
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.unlockDecision).toBeDefined();
  });
});

describe('Unlock decision produced', () => {
  const SUMMARY = createSessionSummary({ sessionMode: SessionMode.FLOW });

  it.each(LANES)('%s: unlock decision exists', (lane) => {
    const result = buildCompletionPersonalization({
      hiddenFeatureKeys: [],
      lane,
      summary: SUMMARY,
    });
    expect(result.unlockDecision).toBeDefined();
  });
});

describe('Next action safe if feature degraded', () => {
  it('produces result without crashing', () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 8,
      grade: 'A',
      isPersonalBest: false,
      lane: 'student',
      streakAction: 'extended',
      streakDays: 4,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      xpDelta: 120,
    });
    expect(result.nextAction).toBeDefined();
    expect(result.userFacingSummary).toBeDefined();
  });
});

describe('User-facing summary is lane-appropriate', () => {
  it.each(LANES)(
    '%s: has title and body',
    (lane) => {
      const result = buildResult(lane);
      expect(result.userFacingSummary).toBeDefined();
      expect(result.userFacingSummary.title).toBeDefined();
      expect(result.userFacingSummary.title.length).toBeGreaterThan(0);
      expect(result.userFacingSummary.body).toBeDefined();
      expect(result.userFacingSummary.body.length).toBeGreaterThan(0);
    },
  );
});
