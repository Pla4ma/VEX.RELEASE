import { resolveCoachState, type CoachSignals } from './helpers';

describe('resolveCoachState — pure resolver', () => {
  const baseSignals: CoachSignals = {
    comebackActive: false,
    streakIsAtRisk: false,
    streakRecentlyBroken: false,
    daysSinceBreak: 0,
    hasUncelebratedMilestone: false,
    sessionOverload: false,
    isMuted: false,
    isColdStart: true,
    profileConfidence: 'LOW',
    dataPoints: 0,
  };

  it('streak risk beats high confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakIsAtRisk: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('STREAK_AT_RISK');
  });

  it('comeback beats premium tease', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      comebackActive: true,
      streakIsAtRisk: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('COMEBACK_MODE');
  });

  it('comeback beats high confidence on established profile', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      comebackActive: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('COMEBACK_MODE');
  });

  it('post-failure support beats generic confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakRecentlyBroken: true,
      daysSinceBreak: 1,
      streakIsAtRisk: false,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('POST_FAILURE_SUPPORT');
  });

  it('post-failure support only for recent breaks', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakRecentlyBroken: true,
      daysSinceBreak: 5,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('HIGH_CONFIDENCE');
  });

  it('milestone hype beats high confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      hasUncelebratedMilestone: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('MILESTONE_HYPE');
  });

  it('overload protection beats active study', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      sessionOverload: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('OVERLOAD_PROTECTION');
  });

  it('muted mode beats everything else', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      isMuted: true,
      comebackActive: true,
      streakIsAtRisk: true,
      sessionOverload: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('MUTED_MODE');
  });

  it('cold start for new users', () => {
    const state = resolveCoachState(baseSignals);
    expect(state).toBe('COLD_START');
  });

  it('cold start beats low confidence on empty profile', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: true,
      profileConfidence: 'LOW',
      dataPoints: 0,
    });
    expect(state).toBe('COLD_START');
  });

  it('high confidence for established users', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      profileConfidence: 'HIGH',
      dataPoints: 30,
    });
    expect(state).toBe('HIGH_CONFIDENCE');
  });

  it('low confidence for moderate data users', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      profileConfidence: 'LOW',
      dataPoints: 10,
    });
    expect(state).toBe('LOW_CONFIDENCE');
  });

  it('streak recently broken with low confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakRecentlyBroken: true,
      daysSinceBreak: 2,
      streakIsAtRisk: false,
      profileConfidence: 'LOW',
      dataPoints: 10,
    });
    expect(state).toBe('POST_FAILURE_SUPPORT');
  });

  it('streak broken but overflow old = falls to confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakRecentlyBroken: true,
      daysSinceBreak: 4,
      profileConfidence: 'MEDIUM',
      dataPoints: 15,
    });
    expect(state).toBe(
      ('MEDIUM' satisfies string) ? 'LOW_CONFIDENCE' : 'LOW_CONFIDENCE',
    );
  });
});
