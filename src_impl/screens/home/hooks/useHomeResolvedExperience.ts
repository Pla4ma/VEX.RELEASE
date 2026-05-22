/**
 * useHomeResolvedExperience — collects real runtime data and returns both
 * VexExperience and FirstWeekExperience for Home consumption.
 *
 * Replaces scattered placeholder values across HomeScreenInner and BossScreen.
 * Components must consume resolvedExperience instead of making independent decisions.
 */
import { useMemo } from 'react';
import { useOnboardingStore } from '../../../features/onboarding/store';
import {
  useResolvedVexExperienceRuntime,
  type VexExperienceRuntimeInput,
} from '../../../features/personalization';
import { useFirstWeekExperience } from '../../../features/personalization/useFirstWeekExperience';
import type {
  VexExperience,
  FeatureAvailabilitySnapshot,
  BehaviorStats,
  MotivationStyle,
} from '../../../features/personalization/schemas';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { HomeController } from './home-controller-types';

export interface HomeResolvedExperience {
  resolvedExperience: VexExperience;
  firstWeekExperience: FirstWeekExperience;
}

export function useHomeResolvedExperience(controller: HomeController): HomeResolvedExperience {
  const explicitStyle = useOnboardingStore((s) => s.explicitMotivationStyle);
  const goal = useOnboardingStore((s) => s.goal);
  const duration = useOnboardingStore((s) => s.focusDuration);
  const onboarded = useOnboardingStore((s) => s.isOnboarded);

  const totalCompletedSessions = controller.disclosure.inputs.totalCompletedSessions;
  const features = controller.disclosure.features;

  const motivationStyle = normalizeMotivationStyle(explicitStyle);
  const primaryGoal = resolvePrimaryGoal(goal);

  const hasActiveBoss = Boolean(
    (controller.activeBossQuery?.data as Record<string, unknown> | null) != null,
  );
  const hasActiveStudyPlan = Boolean(
    (controller.activeStudyPlanQuery?.data as Record<string, unknown> | null) != null,
  );
  const hasActiveRecommendation = Boolean(controller.primaryRecommendation);
  const isFirstSession = controller.isFirstRun || totalCompletedSessions === 0;

  const startedAt = useOnboardingStore.getState().startedAt;
  const daysSinceOnboarding = onboarded && startedAt != null
    ? computeDaysSinceTimestamp(typeof startedAt === 'number' ? startedAt : Date.now())
    : 0;
  const latestEndedAt = (controller.latestSession as Record<string, unknown> | null)?.endedAt as number | undefined;
  const daysSinceLastSession = latestEndedAt != null ? computeDaysSinceTimestamp(latestEndedAt) : null;

  const featureAvailability: FeatureAvailabilitySnapshot = {
    boss: Boolean(features.boss_tab?.isUnlocked),
    challenges: Boolean(features.challenges?.isUnlocked),
    premium: Boolean(features.premium_paywall?.isUnlocked),
    study: Boolean(features.content_study?.isUnlocked),
  };

  const behaviorStats: BehaviorStats = {
    totalCompletedSessions,
    abandonedSessionDurations: [],
    bossChallengeEngagement: hasActiveBoss ? 'medium' : 'none',
    coachInteractions: computeCoachInteractions(controller),
    comebackSessions: computeComebackSessions(controller),
    completedSessionDurations: [],
    completionStreak: controller.currentStreak,
    ignoredFeatures: [],
    mostSuccessfulTimeOfDay: null,
    preferredSessionMode: null,
    premiumFeatureAttempts: [],
    studyUsageRatio: computeStudyUsageRatio(totalCompletedSessions, hasActiveStudyPlan),
  };

  const vexInput: VexExperienceRuntimeInput = {
    behaviorStats,
    featureAvailability,
  };

  const resolvedExperience = useResolvedVexExperienceRuntime(vexInput);

  const firstWeekExperience = useFirstWeekExperience({
    completedSessions: totalCompletedSessions,
    daysSinceOnboarding,
    daysSinceLastSession,
    motivationStyle: motivationStyle as 'calm' | 'friendly' | 'coach_led' | 'study_focused' | 'game_like' | 'intense' | undefined,
    primaryGoal,
    bossEngagement: behaviorStats.bossChallengeEngagement,
    studyUsageRatio: behaviorStats.studyUsageRatio,
    isPremium: false,
    featureAvailable: {
      boss: featureAvailability.boss,
      premium: featureAvailability.premium,
      social: false,
      study: featureAvailability.study,
    },
  });

  return useMemo(() => ({
    resolvedExperience,
    firstWeekExperience,
  }), [resolvedExperience, firstWeekExperience]);
}

function normalizeMotivationStyle(style: string | null): MotivationStyle {
  switch (style) {
    case 'calm':
    case 'friendly':
    case 'coach_led':
    case 'game_like':
    case 'intense':
    case 'study_focused':
      return style;
    default:
      return 'calm';
  }
}

function resolvePrimaryGoal(goal: string | null): string {
  switch (goal) {
    case 'STUDY': return 'study';
    case 'WORK': return 'work';
    case 'CREATIVE': return 'creative';
    case 'PERSONAL': return 'personal_growth';
    default: return 'focus';
  }
}

function computeDaysSinceTimestamp(ts: number): number {
  return Math.max(0, Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24)));
}

function computeStudyUsageRatio(
  totalCompleted: number, hasActiveStudyPlan: boolean,
): number {
  if (totalCompleted === 0) return 0;
  if (hasActiveStudyPlan) return 0.4;
  return 0;
}

function computeCoachInteractions(_controller: HomeController): number {
  return 0;
}

function computeComebackSessions(controller: HomeController): number {
  const comebackData = controller.comebackQuery?.data as
    { isComeback?: boolean; streakRestoreEligible?: boolean } | undefined;
  if (!comebackData?.streakRestoreEligible) return 0;
  const history = (controller.historyQuery as unknown as { history: Array<{ status: string }> }).history;
  return history?.filter((e) => e.status === 'COMPLETED').length ?? 0;
}
