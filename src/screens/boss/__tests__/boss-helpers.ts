import {
  deriveBossEngagementLevel,
  type BossEngagementInputs,
} from '../../../features/boss/boss-engagement-signals';
import { resolveBossIntensity } from '../../../features/personalization/experience-service-helpers';
import type {
  BehaviorStats,
  VexPersonalizationProfile,
} from '../../../features/personalization/schemas';

export const calmProfile: VexPersonalizationProfile = {
  primaryGoal: 'study',
  motivationStyle: 'calm',
  preferredTone: 'soft',
  gamificationIntensity: 'minimal',
  coachMode: 'reflection',
  studyLayerName: 'Study OS',
  defaultSessionDuration: 25,
  defaultSessionMode: 'FOCUS',
  userStage: 'new',
};

export const gameLikeProfile: VexPersonalizationProfile = {
  ...calmProfile,
  motivationStyle: 'game_like',
  preferredTone: 'direct',
  gamificationIntensity: 'strong',
  coachMode: 'game_guide',
};

export const intenseProfile: VexPersonalizationProfile = {
  ...calmProfile,
  motivationStyle: 'intense',
  preferredTone: 'direct',
  gamificationIntensity: 'strong',
  coachMode: 'tactical',
};

export const studyFocusedProfile: VexPersonalizationProfile = {
  ...calmProfile,
  motivationStyle: 'study_focused',
  preferredTone: 'strategic',
  coachMode: 'study_tutor',
};

export const baseStats: BehaviorStats = {
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
  totalCompletedSessions: 3,
};

export { deriveBossEngagementLevel, resolveBossIntensity };
export type { BossEngagementInputs };
