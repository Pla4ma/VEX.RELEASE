import { useMemo } from 'react';
import { useOnboardingStore } from '../../../features/onboarding/store';
import {
  useResolvedVexExperienceRuntime,
  type VexExperienceRuntimeInput,
} from '../../../features/personalization';
import { useFirstWeekExperience } from '../../../features/personalization/useFirstWeekExperience';
import {
  recordBehaviorSignal,
} from '../../../features/personalization/behavior-signal-store';
import type {} from '../../../features/personalization/schemas';
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

  const activeBossData = controller.activeBossQuery
    ?.data as ActiveBossData | null;
  const activeStudyPlanData = controller.activeStudyPlanQuery
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

  const firstWeekExperience = useFirstWeekExperience({
    completedSessions: totalCompletedSessions,
    daysSinceOnboarding,
    daysSinceLastSession,
    motivationStyle: motivationStyle as
      | 'calm'
      | 'friendly'
      | 'coach_led'
      | 'study_focused'
      | 'game_like'
      | 'intense'
      | undefined,
    primaryGoal,
    bossEngagement: behaviorStats.bossChallengeEngagement,
    studyUsageRatio: behaviorStats.studyUsageRatio,
    isPremium: false,
    laneProfile,
    featureAvailable: {
      boss: featureAvailability.boss,
      premium: featureAvailability.premium,
      social: false,
      study: featureAvailability.study,
    },
  });

  const userStage = resolveUserStage(totalCompletedSessions);

  const canonicalProfile = useMemo(
    () => ({
      motivationStyle,
      primaryGoal,
      gamificationIntensity: resolveGamificationIntensity(motivationStyle),
      studyLayerName: firstWeekExperience.studyLayerLabel,
      userStage,
    }),
    [
      motivationStyle,
      primaryGoal,
      firstWeekExperience.studyLayerLabel,
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
      firstWeekExperience,
      laneProfile,
      personalizationProfile: canonicalProfile,
      behaviorStats: canonicalBehavior,
    }),
    [
      resolvedExperience,
      firstWeekExperience,
      laneProfile,
      canonicalProfile,
      canonicalBehavior,
    ],
  );
}
