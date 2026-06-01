import {
  LANES,
  UNLOCK_KEYS,
  buildResult,
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
  createSessionSummary,
  SessionMode,
} from './helpers';

describe('First session creates return plan', () => {
  it.each(LANES)('%s: progressProof shows xpDelta and completion', (lane) => {
    const result = buildResult(lane, { xpDelta: 80 });
    expect(result.progressProof.xpDelta).toBe(80);
    expect(result.progressProof.effectiveMinutes).toBeGreaterThan(0);
    expect(result.progressProof.completionPercentage).toBe(100);
  });
});

describe('Memory candidate with evidence', () => {
  it('includes session ID in evidence text', () => {
    const result = buildResult('student');
    expect(result.memoryCandidates[0].text).toContain('s:');
    expect(result.memoryCandidates[0].source).toBe('session_completion');
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
    expect(result.memoryCandidates[0].text).toContain(
      'The structure helped me stay focused.',
    );
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
    expect(result.nextActionLabel).toBeDefined();
    expect(result.displayBody).toBeDefined();
  });
});

describe('Lane confidence updates with enough evidence', () => {
  it('clean completion has medium confidence', () => {
    const result = buildResult('student');
    expect(result.laneProfile.confidenceBand).toBe('medium');
    expect(result.laneProfile.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it('partial completion has low confidence', () => {
    const result = buildResult('game_like', {
      grade: 'C',
      summary: {
        completionPercentage: 40,
        sessionMode: SessionMode.FLOW,
        status: 'COMPLETED',
      },
      focusScoreDelta: 0,
      xpDelta: 50,
    });
    expect(result.laneProfile.confidenceBand).toBe('low');
  });

  it('abandoned has low confidence', () => {
    const result = buildResult('deep_creative', {
      grade: 'D',
      summary: {
        completionPercentage: 0,
        sessionMode: SessionMode.FLOW,
        status: 'ABANDONED' as const,
      },
      focusScoreDelta: -8,
      xpDelta: 0,
    });
    expect(result.laneProfile.confidenceBand).toBe('low');
  });
});

describe('Unlock decision produced but hidden systems stay hidden', () => {
  const SUMMARY = createSessionSummary({ sessionMode: SessionMode.FLOW });

  it.each(LANES)('%s: hidden unlock when featureKey in hidden list', (lane) => {
    const result = buildCompletionPersonalization({
      hiddenFeatureKeys: [UNLOCK_KEYS[lane]],
      lane,
      summary: SUMMARY,
    });
    expect(result.unlockDecision.hidden).toBe(true);
    expect(result.unlockDecision.status).toBe('blocked');
  });

  it.each(LANES)(
    '%s: visible unlock when featureKey not in hidden list',
    (lane) => {
      const result = buildCompletionPersonalization({
        hiddenFeatureKeys: [],
        lane,
        summary: SUMMARY,
      });
      expect(result.unlockDecision.hidden).toBe(false);
      expect(result.unlockDecision.status).toBe('teased');
    },
  );
});

describe('Next action safe if feature degraded', () => {
  it('produces result without crashing when nextAction is null', () => {
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
    expect(result.nextAction).toBeNull();
    expect(result.progressProof.xpDelta).toBe(120);
    expect(result.userFacingSummary.displayTitle).toBeDefined();
  });
});

describe('XP / streak / progress still update', () => {
  it('progressProof carries xpDelta', () => {
    const result = buildResult('student', { xpDelta: 200 });
    expect(result.progressProof.xpDelta).toBe(200);
  });

  it('progressProof carries streak info', () => {
    const result = buildResult('game_like', { streakDays: 7 });
    expect(result.progressProof.streakDays).toBe(7);
    expect(result.progressProof.streakAction).toBe('extended');
  });

  it('progressProof carries focus score delta', () => {
    const result = buildResult('deep_creative', { focusScoreDelta: 12 });
    expect(result.progressProof.focusScoreDelta).toBe(12);
  });

  it('progressProof carries grade', () => {
    const result = buildResult('minimal_normal', { grade: 'A' });
    expect(result.progressProof.grade).toBe('A');
  });

  it('progressProof reflects personal best', () => {
    const pb = buildResult('student', { isPersonalBest: true });
    expect(pb.progressProof.isPersonalBest).toBe(true);
    const noPb = buildResult('student', { isPersonalBest: false });
    expect(noPb.progressProof.isPersonalBest).toBe(false);
  });
});

describe('User-facing summary is lane-appropriate', () => {
  it.each(LANES)(
    '%s: has displayTitle, displayBody, nextActionLabel',
    (lane) => {
      const result = buildResult(lane);
      expect(result.userFacingSummary.displayTitle.length).toBeGreaterThan(0);
      expect(result.userFacingSummary.displayBody.length).toBeGreaterThan(0);
      expect(result.userFacingSummary.nextActionLabel.length).toBeGreaterThan(
        0,
      );
    },
  );
});
