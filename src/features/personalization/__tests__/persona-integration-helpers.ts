import { resolveVexExperience } from '../service';
import type { BehaviorStats, VexPersonalizationProfile } from '../schemas';

export const baseAvailability = { boss: true, challenges: true, premium: false, study: true };

export function profile(style: string): VexPersonalizationProfile {
  return {
    primaryGoal: style === 'study_focused' ? 'study' : style === 'calm' ? 'personal' : 'work',
    motivationStyle: style as VexPersonalizationProfile['motivationStyle'],
    preferredTone: style === 'intense' ? 'direct' : style === 'coach_led' ? 'strategic' : 'soft',
    gamificationIntensity: style === 'game_like' || style === 'intense' ? 'strong' : 'medium',
    coachMode: 'reflection',
    studyLayerName: style === 'study_focused' ? 'Study OS' : 'Deep Work Plan',
    defaultSessionDuration: 25,
    defaultSessionMode: 'FOCUS',
    userStage: 'new',
  };
}

export function stats(overrides: Partial<BehaviorStats> = {}): BehaviorStats {
  return {
    totalCompletedSessions: 0,
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
    ...overrides,
  };
}

export { resolveVexExperience };
