import { SessionMode, resolveActiveSessionDisplayPolicy } from './active-session-display-policy-helpers';

describe('resolveActiveSessionDisplayPolicy — lane profiles & game-like motivation', () => {
  it('clean lane active focus is minimal with no extra widgets', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      laneProfile: {
        primaryLane: 'minimal_normal',
        secondaryLane: null,
        confidence: 0.9,
        confidenceBand: 'high',
        source: 'manual_override',
        evidence: [],
        traits: { needsStructure: 0.5, wantsPlay: 0.1, needsContinuity: 0.3, wantsQuiet: 0.9 },
        resolvedAt: Date.now(),
      },
      motivationStyle: 'calm',
      primaryGoal: 'focus',
      sessionMode: SessionMode.FLOW,
    });
    expect(policy.heroDensity).toBe('minimal');
    expect(policy.showBossHUD).toBe(false);
    expect(policy.showBossTinyIndicator).toBe(false);
    expect(policy.showCompanionLayer).toBe(false);
    expect(policy.showDailyProgress).toBe(false);
    expect(policy.showMomentumScore).toBe(false);
    expect(policy.showStudyTarget).toBe(false);
    expect(policy.showPurityScore).toBe(false);
    expect(policy.showModeOverlay).toBe(false);
  });

  it('clean lane paused hides contract reminder, daily progress, companion', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'paused',
      laneProfile: {
        primaryLane: 'minimal_normal',
        secondaryLane: null,
        confidence: 0.9,
        confidenceBand: 'high',
        source: 'manual_override',
        evidence: [],
        traits: { needsStructure: 0.5, wantsPlay: 0.1, needsContinuity: 0.3, wantsQuiet: 0.9 },
        resolvedAt: Date.now(),
      },
      motivationStyle: 'calm',
      primaryGoal: 'focus',
      sessionMode: SessionMode.FLOW,
    });
    expect(policy.showContractReminder).toBe(false);
    expect(policy.showDailyProgress).toBe(false);
    expect(policy.showCompanionLayer).toBe(false);
    expect(policy.showCoachBanner).toBe(true);
  });

  it('project lane active focus is minimal, no game indicators', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      laneProfile: {
        primaryLane: 'deep_creative',
        secondaryLane: null,
        confidence: 0.85,
        confidenceBand: 'high',
        source: 'manual_override',
        evidence: [],
        traits: { needsStructure: 0.4, wantsPlay: 0.3, needsContinuity: 0.9, wantsQuiet: 0.5 },
        resolvedAt: Date.now(),
      },
      motivationStyle: 'calm',
      primaryGoal: 'creative',
      sessionMode: SessionMode.CREATIVE,
    });
    expect(policy.heroDensity).toBe('minimal');
    expect(policy.showBossHUD).toBe(false);
    expect(policy.showBossTinyIndicator).toBe(false);
    expect(policy.showMomentumScore).toBe(false);
    expect(policy.showDailyProgress).toBe(false);
    expect(policy.showPurityScore).toBe(false);
  });

  it('lane profile overrides heuristic lane detection', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      laneProfile: {
        primaryLane: 'student',
        secondaryLane: null,
        confidence: 0.9,
        confidenceBand: 'high',
        source: 'onboarding',
        evidence: [],
        traits: { needsStructure: 0.9, wantsPlay: 0.2, needsContinuity: 0.5, wantsQuiet: 0.4 },
        resolvedAt: Date.now(),
      },
      motivationStyle: 'game_like',
      primaryGoal: 'work',
      sessionMode: SessionMode.CHALLENGE,
    });
    expect(policy.showStudyTarget).toBe(true);
    expect(policy.showBossTinyIndicator).toBe(false);
    expect(policy.showBossHUD).toBe(false);
  });

  it('game-like lane detected via motivation shows tiny boss indicator', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      bossIntensity: 'visible',
      focusStage: 'active',
      motivationStyle: 'intense',
      primaryGoal: 'work',
      sessionMode: SessionMode.CHALLENGE,
    });
    expect(policy.showBossTinyIndicator).toBe(true);
    expect(policy.showBossHUD).toBe(false);
  });
});
