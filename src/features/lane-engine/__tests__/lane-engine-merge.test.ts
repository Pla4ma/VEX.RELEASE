import {
  mergeLaneProfiles,
  resolveInitialLane,
} from '../service';
import { observedAt } from './lane-engine.helpers';

describe('Lane Engine — mergeLaneProfiles', () => {
  const baseStudentProfile = resolveInitialLane({
    primaryGoal: 'study',
    motivationStyle: 'study_focused',
    observedAt,
  });

  it('should prefer behavior profile when more confident', () => {
    const onboarding = baseStudentProfile;
    const behavior = {
      ...onboarding,
      primaryLane: 'game_like',
      confidence: 0.9,
      source: 'behavior' as const,
    };
    const result = mergeLaneProfiles({
      onboardingProfile: onboarding,
      behaviorProfile: behavior,
      completedSessions: 10,
    });
    expect(result.primaryLane).toBe('game_like');
  });

  it('should prefer onboarding profile when more confident', () => {
    const onboarding = baseStudentProfile;
    const behavior = {
      ...onboarding,
      primaryLane: 'game_like',
      confidence: 0.3,
      source: 'behavior' as const,
    };
    const result = mergeLaneProfiles({
      onboardingProfile: onboarding,
      behaviorProfile: behavior,
      completedSessions: 10,
    });
    expect(result.primaryLane).toBe('student');
  });

  it('should return onboarding profile for low session count', () => {
    const onboarding = resolveInitialLane({
      primaryGoal: 'study',
      observedAt,
    });
    const result = mergeLaneProfiles({
      onboardingProfile: onboarding,
      behaviorProfile: {
        ...onboarding,
        primaryLane: 'game_like',
      },
      completedSessions: 1,
    });
    expect(result).toEqual(onboarding);
  });

  it('should return manual override onboarding profile', () => {
    const onboarding = resolveInitialLane({
      primaryGoal: 'study',
      manualOverride: 'game_like',
      observedAt,
    });
    const result = mergeLaneProfiles({
      onboardingProfile: onboarding,
      behaviorProfile: {
        ...onboarding,
        primaryLane: 'student',
      },
      completedSessions: 10,
    });
    expect(result.primaryLane).toBe('game_like');
  });
});
