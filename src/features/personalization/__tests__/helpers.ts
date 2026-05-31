import { describe, it, expect } from '@jest/globals';
import { resolveVexExperience } from '../service';
import type {
  VexPersonalizationProfile,
  BehaviorStats,
  FeatureAvailabilitySnapshot,
} from '../schemas';

export function makeProfile(
  overrides: Partial<VexPersonalizationProfile> = {},
): VexPersonalizationProfile {
  return {
    primaryGoal: 'work',
    motivationStyle: 'calm',
    preferredTone: 'soft',
    gamificationIntensity: 'minimal',
    coachMode: 'reflection',
    studyLayerName: 'Deep Work Plan',
    defaultSessionDuration: 25,
    defaultSessionMode: 'FOCUS',
    userStage: 'new',
    ...overrides,
  };
}

export function makeStats(
  overrides: Partial<BehaviorStats> = {},
): BehaviorStats {
  return {
    abandonedSessionDurations: [],
    bossChallengeEngagement: 'none',
    coachInteractions: 0,
    comebackSessions: 0,
    completedSessionDurations: [],
    completionStreak: 0,
    ignoredFeatures: [],
    mostSuccessfulTimeOfDay: null,
    preferredSessionMode: null,
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions: 0,
    ...overrides,
  };
}

export const defaultAvailability: FeatureAvailabilitySnapshot = {
  boss: false,
  challenges: false,
  premium: false,
  study: false,
};

export { resolveVexExperience };
