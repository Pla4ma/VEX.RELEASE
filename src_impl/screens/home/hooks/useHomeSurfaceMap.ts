/**
 * useHomeSurfaceMap — wires decideHomeSurfaces into Home rendering.
 *
 * Consumed by Home containers to drive surface visibility.
 * Replaces scattered feature checks inside presentation components.
 */
import { useMemo } from 'react';
import { decideHomeSurfaces } from '../../../features/home-experience/home-surface-decision';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { MotivationProfileType } from '../../../features/liveops-config/feature-access';

interface UseHomeSurfaceMapInput {
  completedSessions: number;
  motivationStyle?: MotivationProfileType;
  primaryGoal?: string;
  bossEngagement: 'none' | 'low' | 'medium' | 'high';
  studyUsageRatio: number;
  coachInteractions: number;
  hasActiveStudyPlan: boolean;
  hasActiveRecommendation: boolean;
  hasActiveBoss: boolean;
  isFirstSession: boolean;
  completionStreak: number;
  featureAccess: FeatureAccessResult;
  firstWeek?: FirstWeekExperience;
}

export function useHomeSurfaceMap(input: UseHomeSurfaceMapInput): HomeSurfaceMap {
  const {
    completedSessions,
    motivationStyle,
    primaryGoal,
    bossEngagement,
    studyUsageRatio,
    coachInteractions,
    hasActiveStudyPlan,
    hasActiveRecommendation,
    hasActiveBoss,
    isFirstSession,
    completionStreak,
    featureAccess,
  } = input;

  const safeStyle = motivationStyle ?? 'friendly';

  return useMemo(() => {
    const fa = featureAccess.features;

    return decideHomeSurfaces({
      featureAvailability: {
        boss: Boolean(fa.boss_tab?.isUnlocked),
        challenges: Boolean(fa.challenges?.isUnlocked),
        premium: Boolean(fa.premium_paywall?.isUnlocked),
        study: Boolean(fa.content_study?.isUnlocked),
      },
      personalizationProfile: {
        motivationStyle: (
          safeStyle === 'calm' || safeStyle === 'friendly' || safeStyle === 'coach_led' ||
          safeStyle === 'game_like' || safeStyle === 'intense' || safeStyle === 'study_focused'
        ) ? safeStyle : 'friendly',
        primaryGoal: (
          primaryGoal === 'focus' || primaryGoal === 'study' || primaryGoal === 'work' ||
          primaryGoal === 'creative' || primaryGoal === 'personal' || primaryGoal === 'learning'
        ) ? primaryGoal : 'focus',
        gamificationIntensity: safeStyle === 'game_like' || safeStyle === 'intense' ? 'strong' : 'medium',
        studyLayerName: input.firstWeek?.studyLayerLabel ?? 'Study OS',
        userStage: completedSessions === 0 ? 'new' : completedSessions < 3 ? 'activating' : completedSessions < 10 ? 'engaged' : 'power',
      },
      behaviorStats: {
        totalCompletedSessions: completedSessions,
        studyUsageRatio,
        bossChallengeEngagement: bossEngagement,
        coachInteractions,
        comebackSessions: 0,
        ignoredFeatures: [],
        premiumFeatureAttempts: [],
        completionStreak,
      },
      hasActiveStudyPlan,
      hasActiveRecommendation,
      hasActiveBoss,
      isFirstSession,
      firstWeekPhase: input.firstWeek,
    });
  }, [
    completedSessions,
    safeStyle,
    primaryGoal,
    bossEngagement,
    studyUsageRatio,
    coachInteractions,
    hasActiveStudyPlan,
    hasActiveRecommendation,
    hasActiveBoss,
    isFirstSession,
    completionStreak,
    featureAccess.features,
    input.firstWeek,
  ]);
}
