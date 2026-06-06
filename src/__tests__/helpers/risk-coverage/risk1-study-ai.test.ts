import {
  hasActiveStudyFollowUp,
  extractStudyContextFromSession,
  buildPostSessionNextAction,
  computeWeakTopics,
  computeWeeklyIntelligence,
  hasWeeklyIntelligenceData,
  SessionMode,
  TEST_UUID,
  sess,
  makeStudyPlan,
} from './helpers';

describe('Risk 1 — Study AI Completion Path', () => {
  it('hasActiveStudyFollowUp true when studyTarget exists', () => {
    const ctx = extractStudyContextFromSession({
      studyTarget: 'Cell Biology',
      studyPlanId: 'plan-1',
    });
    expect(hasActiveStudyFollowUp(ctx)).toBe(true);
  });

  it('hasActiveStudyFollowUp false with no study data', () => {
    const ctx = extractStudyContextFromSession(undefined);
    expect(hasActiveStudyFollowUp(ctx)).toBe(false);
  });

  it('buildPostSessionNextAction with study context returns STUDY mode review CTA', () => {
    const summary = sess({
      sessionMode: SessionMode.STUDY,
      sessionId: TEST_UUID,
      userId: TEST_UUID,
    });
    const result = buildPostSessionNextAction({
      summary,
      studyContext: { studyTarget: 'Cell Biology', studyPlanId: 'plan-1' },
    });
    expect(result.ctaLabel).toBe('Review next');
    expect(result.reason).toContain('Cell Biology');
    expect(result.routeParams.presetMode).toBe('STUDY');
  });

  it('buildPostSessionNextAction without study context generates recommendation', () => {
    const summary = sess({
      sessionMode: SessionMode.LIGHT_FOCUS,
      sessionId: TEST_UUID,
      userId: TEST_UUID,
    });
    const result = buildPostSessionNextAction({ summary });
    expect(result.ctaLabel).toBe('Start next focus');
    expect(result.routeParams.recommendationId).toContain(TEST_UUID);
  });

  it('computeWeakTopics returns empty for no plans', () => {
    expect(computeWeakTopics([])).toHaveLength(0);
  });

  it('computeWeakTopics detects weak review confidence', () => {
    const plan = makeStudyPlan();
    const topics = computeWeakTopics([plan]);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.find((t) => t.topic === 'cell')).toBeDefined();
  });

  it('computeWeeklyIntelligence returns valid structure for no data', () => {
    const intel = computeWeeklyIntelligence({ plans: [], streakDays: 0 });
    expect(intel.suggestion).toContain('first study block');
  });

  it('hasWeeklyIntelligenceData: false for empty, true when done blocks exist', () => {
    expect(hasWeeklyIntelligenceData([])).toBe(false);
    const plan = makeStudyPlan();
    expect(hasWeeklyIntelligenceData([plan])).toBe(true);
  });
});
