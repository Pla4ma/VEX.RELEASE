import { confirmInitialLane, resolveBehaviorLane, resolveInitialLane, mergeLaneProfiles, shouldReconsiderLane } from '../service';
import { observedAt } from './lane-engine.helpers';

describe('Lane Engine — confirmation & overrides', () => {
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

    const behavior = resolveBehaviorLane({
      primaryGoal: 'creative',
      motivationStyle: 'game_like',
      completedSessions: 10,
      bossEngagement: 'high',
      manualOverride: 'minimal_normal',
      observedAt,
    });
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
    expect(mergeLaneProfiles({ onboardingProfile: onboarding, behaviorProfile: behavior, completedSessions: 1 }))
      .toEqual(onboarding);
  });
});
