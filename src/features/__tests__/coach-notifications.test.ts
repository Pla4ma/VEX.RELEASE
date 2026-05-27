import {
  getCoachPresenceMessage,
  getLaneMechanicPolicy,
  decideNudge,
  baseLaneProfile,
} from './helpers';

describe('Completion (CoachPresence via copy-service)', () => {
  it('completion context with study goal returns START_STUDY_SESSION', () => {
    const result = getCoachPresenceMessage({
      aiAvailable: true,
      bossIntensity: null,
      comebackState: null,
      completionContext: null,
      firstWeekStage: 'day_3_5',
      latestSession: null,
      memoryConfidence: 'medium',
      motivationStyle: 'STUDY_FOCUSED',
      premiumMoment: 'none',
      primaryGoal: 'study',
      sessionMode: 'inactive',
      studyLayerLabel: 'Study',
    });
    expect(result.safeIntent).toBe('START_STUDY_SESSION');
  });

  it('completion context with focus goal returns START_SESSION', () => {
    const result = getCoachPresenceMessage({
      aiAvailable: true,
      bossIntensity: null,
      comebackState: null,
      completionContext: null,
      firstWeekStage: 'day_1_2',
      latestSession: null,
      memoryConfidence: 'medium',
      motivationStyle: 'CALM',
      premiumMoment: 'none',
      primaryGoal: 'focus',
      sessionMode: 'inactive',
      studyLayerLabel: null,
    });
    expect(result.safeIntent).toBe('START_SESSION');
  });

  it('LaneMechanicPolicy from LaneProfile blocks old economy for deep_creative and minimal_normal', () => {
    for (const lane of ['deep_creative', 'minimal_normal'] as const) {
      const profile = baseLaneProfile({ primaryLane: lane });
      const policy = getLaneMechanicPolicy(profile);
      expect(policy.blockedMechanics).toContain('economy');
    }
  });

  it('LaneMechanicPolicy from LaneProfile blocks shop across all lanes', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const profile = baseLaneProfile({ primaryLane: lane });
      const policy = getLaneMechanicPolicy(profile);
      const oldEconomy = ['shop', 'gems', 'wagers', 'economy', 'trading'];
      const anyOldEconomyBlocked = oldEconomy.some((m) => policy.blockedMechanics.includes(m as never));
      expect(anyOldEconomyBlocked).toBe(true);
    }
  });
});

describe('CoachPresence (copy-service tone/mood maps)', () => {
  it('each motivation style maps to distinct tone', () => {
    const results = new Set<string>();
    for (const style of ['CALM', 'FRIENDLY', 'COACH_LED', 'GAME_LIKE', 'INTENSE', 'STUDY_FOCUSED'] as const) {
      const result = getCoachPresenceMessage({
        aiAvailable: true,
        bossIntensity: null,
        comebackState: null,
        completionContext: null,
        firstWeekStage: null,
        latestSession: null,
        memoryConfidence: 'none',
        motivationStyle: style,
        premiumMoment: 'none',
        primaryGoal: 'focus',
        sessionMode: 'inactive',
        studyLayerLabel: null,
      });
      results.add(result.tone);
      expect(result.shouldShow).toBe(true);
    }
    expect(results.size).toBeGreaterThanOrEqual(3);
  });

  it('CALM motivation style suppresses during active focus', () => {
    const result = getCoachPresenceMessage({
      aiAvailable: true,
      bossIntensity: null,
      comebackState: null,
      completionContext: null,
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: 'none',
      motivationStyle: 'CALM',
      premiumMoment: 'none',
      primaryGoal: 'focus',
      sessionMode: 'active_focus',
      studyLayerLabel: null,
    });
    expect(result.displayMode).toBe('quiet');
    expect(result.shouldShow).toBe(false);
  });
});

describe('NotificationPolicy (decideNudge)', () => {
  it('minimal_normal lane has max 1 nudge per day', () => {
    const decision = decideNudge({
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      sentToday: 1,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.budgetRemaining).toBe(0);
  });

  it('student lane has max 2 nudges per day', () => {
    const decision = decideNudge({
      lane: 'student',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      sentToday: 1,
    });
    expect(decision.allowed).toBe(true);
    expect(decision.budgetRemaining).toBe(1);
  });

  it('game_like lane maps context to run_continue nudge type', () => {
    const decision = decideNudge({
      lane: 'game_like',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      context: 'run_open',
    });
    expect(decision.type).toBe('run_continue');
    expect(decision.title).toBe('One encounter');
  });

  it('deep_creative lane maps context to project_resume nudge type', () => {
    const decision = decideNudge({
      lane: 'deep_creative',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      context: 'project_stale',
    });
    expect(decision.type).toBe('project_resume');
    expect(decision.title).toBe('Next move');
  });

  it('student lane maps context to study_deadline nudge type', () => {
    const decision = decideNudge({
      lane: 'student',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      context: 'deadline',
    });
    expect(decision.type).toBe('study_deadline');
    expect(decision.priority).toBe('high');
  });
});
