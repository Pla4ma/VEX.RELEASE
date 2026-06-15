import {
  confirmInitialLane,
  getLaneMechanicPolicy,
  resolveInitialLane,
  resolveBehaviorLane,
  mergeLaneProfiles,
} from '../service';
import { observedAt } from './lane-engine.helpers';

describe('Lane Engine — mechanic policy & Day 0', () => {
  it('missing profile falls back to Focus low-confidence', () => {
    const result = resolveInitialLane({ observedAt });

    expect(result.primaryLane).toBe('minimal_normal');
    expect(result.confidenceBand).toBe('low');
    expect(result.source).toBe('fallback');
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('LaneMechanicPolicy outputs mechanics, not FeatureAvailability gates', () => {
    for (const lane of [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ] as const) {
      const profile = resolveInitialLane({ manualOverride: lane, observedAt });
      const policy = getLaneMechanicPolicy(profile);

      expect(policy.lane).toBeDefined();
      expect(policy.preferredMechanics).toBeDefined();
      expect(policy.blockedMechanics).toBeDefined();

      expect((policy as Record<string, unknown>).canRender).toBeUndefined();
      expect((policy as Record<string, unknown>).canRoute).toBeUndefined();
      expect((policy as Record<string, unknown>).canQuery).toBeUndefined();
      expect((policy as Record<string, unknown>).canSubscribe).toBeUndefined();
      expect((policy as Record<string, unknown>).canNotify).toBeUndefined();

      expect(Array.isArray(policy.preferredMechanics)).toBe(true);
      expect(policy.preferredMechanics.length).toBeGreaterThan(0);
    }
  });

  it('confirmInitialLane outputs LaneConfirmation with all required fields', () => {
    const result = confirmInitialLane({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      observedAt,
    });

    expect(result.recommendedLane).toBeDefined();
    expect(result.userFacingName).toBeDefined();
    expect(result.reason).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.canChangeLater).toBe(true);
    expect(['Study', 'Quest', 'Create', 'Focus']).toContain(
      result.userFacingName,
    );
  });

  it('first-run asks for lane confirmation via confirmInitialLane', () => {
    const result = confirmInitialLane({
      primaryGoal: 'study',
      motivationStyle: 'calm',
      observedAt,
    });
    expect(result.recommendedLane).toBeDefined();
    expect(result.userFacingName).toBeDefined();
    expect(result.canChangeLater).toBe(true);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it('user can accept recommended lane', () => {
    const result = confirmInitialLane({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      observedAt,
    });
    expect(result.recommendedLane).toBe('student');
  });

  it('user can choose another lane via manualOverride', () => {
    const recommended = confirmInitialLane({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      observedAt,
    });
    expect(recommended.recommendedLane).toBe('student');

    const override = confirmInitialLane({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      manualOverride: 'game_like',
      observedAt,
    });
    expect(override.recommendedLane).toBe('game_like');
    expect(override.userFacingName).toBe('Quest');
    expect(override.confidence).toBe(1);
  });

  it('lane override persists via manual_override source', () => {
    const profile = resolveInitialLane({
      manualOverride: 'minimal_normal',
      observedAt,
    });
    expect(profile.source).toBe('manual_override');
    expect(profile.confidence).toBe(1);

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
    const profile = resolveInitialLane({
      manualOverride: 'student',
      observedAt,
    });
    const policy = getLaneMechanicPolicy(profile);

    expect(policy.preferredMechanics).toContain('study_os');
    expect(policy.blockedMechanics).toContain('wagers');
    expect(policy.blockedMechanics).toContain('shop');
    expect(policy.blockedMechanics).not.toContain('study_os');
  });

  it('Quest Day 0 getLaneMechanicPolicy includes personal_boss, excludes wagers', () => {
    const profile = resolveInitialLane({
      manualOverride: 'game_like',
      observedAt,
    });
    const policy = getLaneMechanicPolicy(profile);

    expect(policy.preferredMechanics).toContain('focus_run');
    expect(policy.blockedMechanics).toContain('wagers');
    expect(policy.blockedMechanics).toContain('generic_leaderboards');
  });

  it('Create Day 0 getLaneMechanicPolicy includes project_thread, flow_window', () => {
    const profile = resolveInitialLane({
      manualOverride: 'deep_creative',
      observedAt,
    });
    const policy = getLaneMechanicPolicy(profile);

    expect(policy.preferredMechanics).toContain('project_thread');
    expect(policy.preferredMechanics).toContain('flow_window');
    expect(policy.blockedMechanics).toContain('loud_combat_default');
  });

  it('Focus Day 0 getLaneMechanicPolicy blocks boss/challenge/premium mechanics', () => {
    const profile = resolveInitialLane({
      manualOverride: 'minimal_normal',
      observedAt,
    });
    const policy = getLaneMechanicPolicy(profile);

    expect(policy.blockedMechanics).toContain('blocker_full_cta');
    expect(policy.blockedMechanics).toContain('challenge_spam');
    expect(policy.blockedMechanics).toContain('economy');
    expect(policy.blockedMechanics).toContain('xp_first_ui');
    expect(policy.preferredMechanics).toContain('low_notifications');
  });

  it('Day 0 uses onboarding only, behavior inference deferred until 3+ sessions', () => {
    const onboarding = resolveInitialLane({
      primaryGoal: 'study',
      motivationStyle: 'calm',
      observedAt,
    });
    const behavior = resolveBehaviorLane({
      primaryGoal: 'study',
      motivationStyle: 'game_like',
      completedSessions: 0,
      bossEngagement: 'high',
      observedAt,
    });
    expect(
      mergeLaneProfiles({
        onboardingProfile: onboarding,
        behaviorProfile: behavior,
        completedSessions: 0,
      }),
    ).toEqual(onboarding);
  });
});
