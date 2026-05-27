import { getLaneMechanicPolicy, mergeLaneProfiles, resolveBehaviorLane, resolveInitialLane } from '../service';
import { observedAt } from './lane-engine.helpers';

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
});
