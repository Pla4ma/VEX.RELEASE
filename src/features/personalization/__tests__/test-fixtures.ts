import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  VexPersonalizationProfile,
} from '../types';

export const available: FeatureAvailabilitySnapshot = {
  boss: true,
  challenges: true,
  study: true,
  premium: true,
};

export const unavailable: FeatureAvailabilitySnapshot = {
  boss: false,
  challenges: false,
  study: false,
  premium: false,
};

export function profile(
  motivationStyle: VexPersonalizationProfile['motivationStyle'],
  overrides: Partial<VexPersonalizationProfile> = {},
): VexPersonalizationProfile {
  return {
    primaryGoal: motivationStyle === 'study_focused' ? 'study' : 'work',
    motivationStyle,
    preferredTone:
      motivationStyle === 'intense'
        ? 'direct'
        : motivationStyle === 'coach_led'
          ? 'strategic'
          : 'soft',
    gamificationIntensity:
      motivationStyle === 'game_like' || motivationStyle === 'intense'
        ? 'strong'
        : 'minimal',
    coachMode:
      motivationStyle === 'study_focused'
        ? 'study_tutor'
        : motivationStyle === 'intense'
          ? 'tactical'
          : motivationStyle === 'game_like'
            ? 'game_guide'
            : motivationStyle === 'coach_led'
              ? 'mentor'
              : 'reflection',
    studyLayerName:
      motivationStyle === 'study_focused' ? 'Study OS' : 'Deep Work Plan',
    defaultSessionDuration: 25,
    defaultSessionMode: motivationStyle === 'study_focused' ? 'STUDY' : 'FOCUS',
    userStage: 'new',
    ...overrides,
  };
}

export function stats(overrides: Partial<BehaviorStats> = {}): BehaviorStats {
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
