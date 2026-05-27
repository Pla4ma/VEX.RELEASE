export type UserStage = 'new' | 'activating' | 'engaged' | 'power';

export type GamificationIntensity = 'minimal' | 'medium' | 'strong';

export interface CanonicalPersonalizationProfile {
  motivationStyle: string;
  primaryGoal: string;
  gamificationIntensity: GamificationIntensity;
  studyLayerName: string;
  userStage: UserStage;
}

export interface CanonicalBehaviorStats {
  totalCompletedSessions: number;
  studyUsageRatio: number;
  deepWorkUsageRatio: number;
  learningUsageRatio: number;
  projectFocusUsageRatio: number;
  structuredExecutionUsageRatio: number;
  bossChallengeEngagement: 'none' | 'low' | 'medium' | 'high';
  coachInteractions: number;
  comebackSessions: number;
  ignoredFeatures: readonly string[];
  premiumFeatureAttempts: number;
  completionStreak: number;
}

export function resolveGamificationIntensity(
  motivationStyle: string,
): GamificationIntensity {
  if (motivationStyle === 'game_like' || motivationStyle === 'intense') return 'strong';
  if (motivationStyle === 'calm') return 'minimal';
  return 'medium';
}

export function resolveUserStage(totalCompletedSessions: number): UserStage {
  if (totalCompletedSessions === 0) return 'new';
  if (totalCompletedSessions < 3) return 'activating';
  if (totalCompletedSessions < 10) return 'engaged';
  return 'power';
}
