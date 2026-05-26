import { confirmInitialLane, getLaneMechanicPolicy, mergeLaneProfiles, resolveBehaviorLane, resolveInitialLane, shouldReconsiderLane } from '../service';

const observedAt = 1_764_000_000_000;

describe('Lane Engine', () => {
  it('resolves STUDY goal plus study style to student with high confidence', () => {
    const result = resolveInitialLane({ primaryGoal: 'study', motivationStyle: 'study_focused', observedAt });

    expect(result.primaryLane).toBe('student');
    expect(result.confidenceBand).toBe('high');
    expect(getLaneMechanicPolicy(result).preferredMechanics).toContain('study_os');
  });

  it('keeps conflicting study and game-like signals stable with secondary lane evidence', () => {
    const result = resolveInitialLane({ primaryGoal: 'study', motivationStyle: 'game_like', observedAt });

    expect(['student', 'game_like']).toContain(result.primaryLane);
    expect(result.secondaryLane === 'student' || result.secondaryLane === 'game_like').toBe(true);
    expect(result.confidence).toBeLessThan(0.75);
  });

  it('resolves creative goal plus creative usage to deep creative', () => {
    const result = resolveBehaviorLane({
      primaryGoal: 'creative',
      motivationStyle: 'coach_led',
      completedSessions: 5,
      deepCreativeUsageRatio: 0.5,
      observedAt,
    });

    expect(result.primaryLane).toBe('deep_creative');
    expect(result.confidenceBand).toBe('high');
  });

  it('resolves calm style plus repeated boss dismissal to minimal normal', () => {
    const result = resolveBehaviorLane({
      primaryGoal: 'personal',
      motivationStyle: 'calm',
      completedSessions: 4,
      bossDismissals: 3,
      observedAt,
    });

    expect(result.primaryLane).toBe('minimal_normal');
    expect(result.confidenceBand).toBe('high');
  });

  it('resolves game-like style plus high boss engagement to game-like', () => {
    const result = resolveBehaviorLane({
      primaryGoal: 'work',
      motivationStyle: 'game_like',
      completedSessions: 6,
      bossEngagement: 'high',
      observedAt,
    });

    expect(result.primaryLane).toBe('game_like');
    expect(getLaneMechanicPolicy(result).blockedMechanics).toContain('wagers');
  });

  it('falls back to minimal normal with low confidence when input is missing', () => {
    const result = resolveInitialLane({ observedAt });

    expect(result.primaryLane).toBe('minimal_normal');
    expect(result.confidenceBand).toBe('low');
    expect(result.source).toBe('fallback');
  });

  it('manual override wins with confidence 1', () => {
    const result = resolveInitialLane({ manualOverride: 'game_like', observedAt });

    expect(result.primaryLane).toBe('game_like');
    expect(result.confidence).toBe(1);
    expect(result.source).toBe('manual_override');
  });

  it('does not reclassify from day zero behavior', () => {
    const onboarding = resolveInitialLane({ primaryGoal: 'study', motivationStyle: 'study_focused', observedAt });
    const behavior = resolveBehaviorLane({
      primaryGoal: 'study',
      motivationStyle: 'game_like',
      completedSessions: 0,
      bossEngagement: 'high',
      observedAt,
    });

    expect(mergeLaneProfiles({ onboardingProfile: onboarding, behaviorProfile: behavior, completedSessions: 0 }))
      .toEqual(onboarding);
  });

  // ─── Phase 5 tests ───

  it('study onboarding recommends Study mode via LaneConfirmation', () => {
    const result = confirmInitialLane({ primaryGoal: 'study', motivationStyle: 'study_focused', observedAt });

    expect(result.recommendedLane).toBe('student');
    expect(result.userFacingName).toBe('Study');
    expect(result.canChangeLater).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('game-like onboarding recommends Run mode via LaneConfirmation', () => {
    const result = confirmInitialLane({ primaryGoal: 'personal', motivationStyle: 'game_like', observedAt });

    expect(result.recommendedLane).toBe('game_like');
    expect(result.userFacingName).toBe('Run');
    expect(result.reason).toContain('Run Mode');
  });

  it('creative/deep onboarding recommends Project mode via LaneConfirmation', () => {
    const result = confirmInitialLane({ primaryGoal: 'creative', motivationStyle: 'coach_led', observedAt });

    expect(result.recommendedLane).toBe('deep_creative');
    expect(result.userFacingName).toBe('Project');
  });

  it('calm/minimal onboarding recommends Clean mode via LaneConfirmation', () => {
    const result = confirmInitialLane({ primaryGoal: 'personal', motivationStyle: 'calm', observedAt });

    expect(result.recommendedLane).toBe('minimal_normal');
    expect(result.userFacingName).toBe('Clean');
  });

  it('manual override wins with confidence 1.0 and behavior cannot override silently', () => {
    const onboarding = resolveInitialLane({ manualOverride: 'minimal_normal', observedAt });

    expect(onboarding.primaryLane).toBe('minimal_normal');
    expect(onboarding.confidence).toBe(1);
    expect(onboarding.source).toBe('manual_override');

    // Behavior with contradicting strong signals must not override
    const behavior = resolveBehaviorLane({
      primaryGoal: 'creative',
      motivationStyle: 'game_like',
      completedSessions: 10,
      bossEngagement: 'high',
      manualOverride: 'minimal_normal',
      observedAt,
    });
    // manualOverride wins in resolveBehaviorLane too
    expect(behavior.primaryLane).toBe('minimal_normal');
    expect(behavior.confidence).toBe(1);
    expect(behavior.source).toBe('manual_override');
  });

  it('behavior can suggest but not silently override manual override via shouldReconsiderLane', () => {
    const current = resolveInitialLane({ manualOverride: 'minimal_normal', observedAt });
    const latest = resolveBehaviorLane({
      primaryGoal: 'creative',
      motivationStyle: 'game_like',
      completedSessions: 10,
      bossEngagement: 'high',
      observedAt,
    });
    // shouldReconsiderLane returns false when source is manual_override
    expect(shouldReconsiderLane({
      currentProfile: current,
      completedSessions: 10,
      latestProfile: latest,
    })).toBe(false);
  });

  it('mergeLaneProfiles keeps manual override even when behavior has higher confidence', () => {
    const onboarding = resolveInitialLane({ manualOverride: 'minimal_normal', observedAt });
    const behavior = resolveBehaviorLane({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      completedSessions: 10,
      observedAt,
    });
    // Behavior profile has high confidence for student but manual override must win
    const merged = mergeLaneProfiles({ onboardingProfile: onboarding, behaviorProfile: behavior, completedSessions: 10 });

    expect(merged.primaryLane).toBe('minimal_normal');
    expect(merged.source).toBe('manual_override');
    expect(merged.confidence).toBe(1);
  });

  it('Day 0 uses onboarding only, no heavy behavior inference', () => {
    const onboarding = resolveInitialLane({ primaryGoal: 'study', motivationStyle: 'study_focused', observedAt });
    const behavior = resolveBehaviorLane({
      primaryGoal: 'study',
      motivationStyle: 'game_like',
      completedSessions: 1,
      bossEngagement: 'high',
      observedAt,
    });
    // Day 0: behavior doesn't override
    expect(mergeLaneProfiles({ onboardingProfile: onboarding, behaviorProfile: behavior, completedSessions: 1 }))
      .toEqual(onboarding);
  });

  it('missing profile falls back to Clean low-confidence', () => {
    const result = resolveInitialLane({ observedAt });

    expect(result.primaryLane).toBe('minimal_normal');
    expect(result.confidenceBand).toBe('low');
    expect(result.source).toBe('fallback');
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('LaneMechanicPolicy outputs mechanics, not FeatureAvailability gates', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const profile = resolveInitialLane({ manualOverride: lane, observedAt });
      const policy = getLaneMechanicPolicy(profile);

      // Verify output shape: only lane, preferredMechanics, blockedMechanics
      expect(policy.lane).toBeDefined();
      expect(policy.preferredMechanics).toBeDefined();
      expect(policy.blockedMechanics).toBeDefined();

      // Verify it does NOT have FeatureAvailability gate fields
      expect((policy as Record<string, unknown>).canRender).toBeUndefined();
      expect((policy as Record<string, unknown>).canRoute).toBeUndefined();
      expect((policy as Record<string, unknown>).canQuery).toBeUndefined();
      expect((policy as Record<string, unknown>).canSubscribe).toBeUndefined();
      expect((policy as Record<string, unknown>).canNotify).toBeUndefined();

      // preferredMechanics is an array of LaneMechanic enum values
      expect(Array.isArray(policy.preferredMechanics)).toBe(true);
      expect(policy.preferredMechanics.length).toBeGreaterThan(0);
    }
  });

  it('confirmInitialLane outputs LaneConfirmation with all required fields', () => {
    const result = confirmInitialLane({ primaryGoal: 'study', motivationStyle: 'study_focused', observedAt });

    expect(result.recommendedLane).toBeDefined();
    expect(result.userFacingName).toBeDefined();
    expect(result.reason).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.canChangeLater).toBe(true);
    // All valid lanes have user-facing names
    expect(['Study', 'Run', 'Project', 'Clean']).toContain(result.userFacingName);
  });

  // ─── Phase 5: Lane Confirmation & Day 0 Activation ───

  it('first-run asks for lane confirmation via confirmInitialLane', () => {
    const result = confirmInitialLane({ primaryGoal: 'study', motivationStyle: 'calm', observedAt });
    expect(result.recommendedLane).toBeDefined();
    expect(result.userFacingName).toBeDefined();
    expect(result.canChangeLater).toBe(true);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it('user can accept recommended lane', () => {
    const result = confirmInitialLane({ primaryGoal: 'study', motivationStyle: 'study_focused', observedAt });
    expect(result.recommendedLane).toBe('student');
    // No further confirmation needed — this IS the acceptance contract
  });

  it('user can choose another lane via manualOverride', () => {
    const recommended = confirmInitialLane({ primaryGoal: 'study', motivationStyle: 'study_focused', observedAt });
    expect(recommended.recommendedLane).toBe('student');

    const override = confirmInitialLane({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      manualOverride: 'game_like',
      observedAt,
    });
    expect(override.recommendedLane).toBe('game_like');
    expect(override.userFacingName).toBe('Run');
    expect(override.confidence).toBe(1);
  });

  it('lane override persists via manual_override source', () => {
    const profile = resolveInitialLane({ manualOverride: 'minimal_normal', observedAt });
    expect(profile.source).toBe('manual_override');
    expect(profile.confidence).toBe(1);

    // Manual override cannot be silently overridden by behavior
    const behavior = resolveBehaviorLane({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      completedSessions: 10,
      manualOverride: 'minimal_normal',
      observedAt,
    });
    expect(behavior.primaryLane).toBe('minimal_normal');
    expect(behavior.source).toBe('manual_override');
  });

  it('Student Day 0 getLaneMechanicPolicy includes study_os, excludes wagers', () => {
    const profile = resolveInitialLane({ manualOverride: 'student', observedAt });
    const policy = getLaneMechanicPolicy(profile);

    expect(policy.preferredMechanics).toContain('study_os');
    expect(policy.blockedMechanics).toContain('wagers');
    expect(policy.blockedMechanics).toContain('shop');
    expect(policy.blockedMechanics).not.toContain('study_os');
  });

  it('Run Day 0 getLaneMechanicPolicy includes personal_boss, excludes wagers', () => {
    const profile = resolveInitialLane({ manualOverride: 'game_like', observedAt });
    const policy = getLaneMechanicPolicy(profile);

    expect(policy.preferredMechanics).toContain('personal_boss');
    expect(policy.blockedMechanics).toContain('wagers');
    expect(policy.blockedMechanics).toContain('generic_leaderboards');
  });

  it('Project Day 0 getLaneMechanicPolicy includes project_thread, flow_window', () => {
    const profile = resolveInitialLane({ manualOverride: 'deep_creative', observedAt });
    const policy = getLaneMechanicPolicy(profile);

    expect(policy.preferredMechanics).toContain('project_thread');
    expect(policy.preferredMechanics).toContain('flow_window');
    expect(policy.blockedMechanics).toContain('loud_combat_default');
  });

  it('Clean Day 0 getLaneMechanicPolicy blocks boss/challenge/premium mechanics', () => {
    const profile = resolveInitialLane({ manualOverride: 'minimal_normal', observedAt });
    const policy = getLaneMechanicPolicy(profile);

    expect(policy.blockedMechanics).toContain('boss_full_cta');
    expect(policy.blockedMechanics).toContain('challenge_spam');
    expect(policy.blockedMechanics).toContain('economy');
    expect(policy.blockedMechanics).toContain('xp_first_ui');
    expect(policy.preferredMechanics).toContain('low_notifications');
  });

  it('Day 0 uses onboarding only, behavior inference deferred until 3+ sessions', () => {
    const onboarding = resolveInitialLane({ primaryGoal: 'study', motivationStyle: 'calm', observedAt });
    const behavior = resolveBehaviorLane({
      primaryGoal: 'study',
      motivationStyle: 'game_like',
      completedSessions: 0,
      bossEngagement: 'high',
      observedAt,
    });
    expect(mergeLaneProfiles({ onboardingProfile: onboarding, behaviorProfile: behavior, completedSessions: 0 }))
      .toEqual(onboarding);
  });
});
