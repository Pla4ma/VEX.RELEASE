import { decideHomeSurfaces } from '../home-surface-decision';
import type { HomeSurfaceMap } from '../surface-decision-schemas';

export const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

export function baseStats(overrides: Record<string, unknown> = {}) {
  return {
    totalCompletedSessions: 0, studyUsageRatio: 0, deepWorkUsageRatio: 0,
    learningUsageRatio: 0, projectFocusUsageRatio: 0,
    structuredExecutionUsageRatio: 0, bossChallengeEngagement: 'none' as const,
    coachInteractions: 0, comebackSessions: 0, ignoredFeatures: [],
    premiumFeatureAttempts: [], completionStreak: 0, ...overrides,
  };
}

export function visibleCount(map: HomeSurfaceMap): number {
  return Object.entries(map).filter(([, v]) => v !== 'hidden' && v !== 'blocked').length;
}

export function visibleEntries(map: HomeSurfaceMap): string[] {
  return Object.entries(map)
    .filter(([, v]) => v !== 'hidden' && v !== 'blocked')
    .map(([k, v]) => `${k}:${v}`);
}

export function day0Map(overrides: {
  motivationStyle?: string;
  primaryGoal?: string;
  gamificationIntensity?: 'minimal' | 'medium' | 'strong';
  laneProfile?: { primaryLane: string };
}) {
  return decideHomeSurfaces({
    featureAvailability,
    personalizationProfile: {
      motivationStyle: overrides.motivationStyle ?? 'coach_led',
      primaryGoal: overrides.primaryGoal ?? 'focus',
      gamificationIntensity: overrides.gamificationIntensity ?? 'medium',
      studyLayerName: 'Study OS',
      userStage: 'new',
    },
    behaviorStats: baseStats(),
    hasActiveStudyPlan: false,
    hasActiveRecommendation: false,
    hasActiveBoss: false,
    isFirstSession: true,
    laneProfile: overrides.laneProfile
      ? { primaryLane: overrides.laneProfile.primaryLane as 'student' | 'game_like' | 'deep_creative' | 'minimal_normal' }
      : undefined,
  });
}
