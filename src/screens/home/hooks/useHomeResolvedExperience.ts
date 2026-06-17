import { useMemo } from 'react';
import { useOnboardingStore } from '../../../features/onboarding/store';
import {
  useResolvedVexExperienceRuntime,
  type VexExperienceRuntimeInput,
} from '../../../features/personalization/hooks';
import {
  useFirstWeekExperience,
  type UseFirstWeekInput,
} from '../../../features/personalization/useFirstWeekExperience';
import {
  recordBehaviorSignal,
} from '../../../features/personalization/behavior-signal-store';
import type { HomeController } from './home-controller-types';
import { useHomeLaneProfile } from './useHomeLaneProfile';
import type {
  ActiveBossData,
  ActiveStudyPlanData,
  HomeFeatureAvailability,
  HomeResolvedExperience,
  LegacySessionData,
} from './home-resolved-experience-types';
import {
  normalizeMotivationStyle,
  resolvePrimaryGoal,
  computeDaysSinceTimestamp,
} from './home-experience-utils';
import {
  resolveGamificationIntensity,
  resolveUserStage,
} from './useHomeExperienceTypes';
import { useHomeBehaviorStats } from './useHomeBehaviorStats';

export { recordBehaviorSignal };

export function useHomeResolvedExperience(
  controller: HomeController,
): HomeResolvedExperience {
  const explicitStyle = useOnboardingStore((s) => s.explicitMotivationStyle);
  const goal = useOnboardingStore((s) => s.goal);
  const onboarded = useOnboardingStore((s) => s.isOnboarded);
  const chosenLane = useOnboardingStore((s) => s.chosenLane);

  const totalCompletedSessions =
    controller.disclosure.inputs.totalCompletedSessions;
  const features = controller.disclosure.features;

  const motivationStyle = normalizeMotivationStyle(explicitStyle);
  const primaryGoal = resolvePrimaryGoal(goal);

  const _activeBossData = controller.activeBossQuery
    ?.data as ActiveBossData | null;
  const _activeStudyPlanData = controller.activeStudyPlanQuery
    ?.data as ActiveStudyPlanData | null;

  const startedAt = useOnboardingStore.getState().startedAt;
  const daysSinceOnboarding =
    onboarded && startedAt != null
      ? computeDaysSinceTimestamp(
          typeof startedAt === 'number' ? startedAt : Date.now(),
        )
      : 0;
  const latestSession = controller.latestSession as LegacySessionData | null;
  const latestEndedAt = latestSession?.endedAt;
  const daysSinceLastSession =
    latestEndedAt != null ? computeDaysSinceTimestamp(latestEndedAt) : null;

  const sessionHistory = controller.historyQuery.history ?? [];
  const completedSessions = sessionHistory.filter(
    (s) => s.status === 'COMPLETED',
  );
  const abandonedSessions = sessionHistory.filter(
    (s) => s.status === 'ABANDONED',
  );

  const featureAvailability: HomeFeatureAvailability = {
    boss: Boolean(features.boss_tab?.isUnlocked),
    challenges: Boolean(features.challenges?.isUnlocked),
    premium: Boolean(features.premium_paywall?.isUnlocked),
    study: Boolean(features.content_study?.isUnlocked),
  };

  const { behaviorStats, resolvedBehaviorSignals } = useHomeBehaviorStats({
    userId: controller.userId,
    totalCompletedSessions,
    completedSessions,
    abandonedSessions,
    sessionHistory,
    currentStreak: controller.currentStreak,
    controller,
  });

  const vexInput: VexExperienceRuntimeInput = {
    behaviorStats,
    featureAvailability,
  };
  const resolvedExperience = useResolvedVexExperienceRuntime(vexInput);

  const laneProfile = useHomeLaneProfile({
    chosenLane,
    motivationStyle,
    preferredSessionMode: behaviorStats.preferredSessionMode,
    primaryGoal,
  });

  const firstWeekInput = useMemo<UseFirstWeekInput>(
    () => ({
      completedSessions: totalCompletedSessions,
      daysSinceOnboarding,
      daysSinceLastSession,
      motivationStyle,
      primaryGoal,
      bossEngagement: behaviorStats.bossChallengeEngagement,
      studyUsageRatio: behaviorStats.studyUsageRatio,
      isPremium: Boolean(features.premium_paywall?.isUnlocked),
      laneProfile,
      featureAvailable: {
        boss: Boolean(features.boss_tab?.isUnlocked),
        premium: Boolean(features.premium_paywall?.isUnlocked),
        social: false,
        study: Boolean(features.content_study?.isUnlocked),
      },
    }),
    [
      totalCompletedSessions,
      daysSinceOnboarding,
      daysSinceLastSession,
      motivationStyle,
      primaryGoal,
      behaviorStats.bossChallengeEngagement,
      behaviorStats.studyUsageRatio,
      features,
      laneProfile,
    ],
  );

  const firstWeekResult = useFirstWeekExperience(firstWeekInput);

  const userStage = resolveUserStage(totalCompletedSessions);

  const canonicalProfile = useMemo(
    () => ({
      motivationStyle,
      primaryGoal,
      gamificationIntensity: resolveGamificationIntensity(motivationStyle),
      studyLayerName: firstWeekResult.studyLayerLabel,
      userStage,
    }),
    [
      motivationStyle,
      primaryGoal,
      firstWeekResult.studyLayerLabel,
      userStage,
    ],
  );

  const canonicalBehavior = useMemo(
    () => ({
      totalCompletedSessions,
      studyUsageRatio: behaviorStats.studyUsageRatio,
      deepWorkUsageRatio: resolvedBehaviorSignals.deepWorkUsageRatio,
      learningUsageRatio: resolvedBehaviorSignals.learningUsageRatio,
      projectFocusUsageRatio: resolvedBehaviorSignals.projectFocusUsageRatio,
      structuredExecutionUsageRatio:
        resolvedBehaviorSignals.structuredExecutionUsageRatio,
      bossChallengeEngagement: behaviorStats.bossChallengeEngagement,
      coachInteractions: behaviorStats.coachInteractions,
      comebackSessions: behaviorStats.comebackSessions,
      ignoredFeatures: behaviorStats.ignoredFeatures,
      premiumFeatureAttempts: behaviorStats.premiumFeatureAttempts,
      completionStreak: behaviorStats.completionStreak,
    }),
    [totalCompletedSessions, behaviorStats, resolvedBehaviorSignals],
  );

  return useMemo(
    () => ({
      resolvedExperience,
      firstWeekExperience: firstWeekResult,
      laneProfile,
      personalizationProfile: canonicalProfile,
      behaviorStats: canonicalBehavior,
    }),
    [
      resolvedExperience,
      firstWeekResult,
      laneProfile,
      canonicalProfile,
      canonicalBehavior,
    ],
  );
}
