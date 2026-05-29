import { decideHomeSurfaces } from "../../../../features/home-experience/home-surface-decision";
export { decideHomeSurfaces };

export function makeBaseInput(overrides: Record<string, unknown> = {}) {
  return {
    featureAvailability: {
      boss: true,
      challenges: true,
      premium: true,
      study: true,
    },
    personalizationProfile: {
      motivationStyle: "calm" as const,
      primaryGoal: "focus" as const,
      gamificationIntensity: "minimal" as const,
      studyLayerName: "Deep Work Plan",
      userStage: "new" as const,
    },
    behaviorStats: {
      totalCompletedSessions: 0,
      studyUsageRatio: 0,
      bossChallengeEngagement: "none" as const,
      coachInteractions: 0,
      comebackSessions: 0,
      ignoredFeatures: [],
      premiumFeatureAttempts: [],
      completionStreak: 0,
    },
    hasActiveStudyPlan: false,
    hasActiveRecommendation: false,
    hasActiveBoss: false,
    isFirstSession: true,
    ...overrides,
  };
}
