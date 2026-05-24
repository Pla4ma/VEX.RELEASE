import { useMemo } from 'react';
import { useOnboardingStore } from '../../../features/onboarding/store';
import {
  useResolvedVexExperienceRuntime,
  type VexExperienceRuntimeInput,
} from '../../../features/personalization';
import { useFirstWeekExperience } from '../../../features/personalization/useFirstWeekExperience';
import {
  getBehaviorSignals,
  recordBehaviorSignal,
} from '../../../features/personalization/behavior-signal-store';
import { resolveUserBehaviorSignals } from '../../../features/personalization/behavior-resolver';
import type {
  BehaviorSignal,
  BehaviorResolverInput,
} from '../../../features/personalization/behavior-signal-schemas';
import type {
  VexExperience,
  FeatureAvailabilitySnapshot,
  BehaviorStats,
  MotivationStyle,
} from '../../../features/personalization/schemas';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { SessionHistoryEntry } from '../../../session/types';
import type { HomeController } from './home-controller-types';
import {
  normalizeMotivationStyle,
  resolvePrimaryGoal,
  computeDaysSinceTimestamp,
  computeCompletedDurations,
  computeAbandonedDurations,
  computePreferredMode,
  computeBestTimeOfDay,
  computeStudyUsageRatio,
  computeCoachInteractions,
  computeComebackSessions,
  type ValidSessionMode,
} from './home-experience-utils';

export { recordBehaviorSignal };

export interface HomeResolvedExperience {
  resolvedExperience: VexExperience;
  firstWeekExperience: FirstWeekExperience;
  personalizationProfile: {
    motivationStyle: MotivationStyle;
    primaryGoal: string;
    gamificationIntensity: 'minimal' | 'medium' | 'strong';
    studyLayerName: string;
    userStage: 'new' | 'activating' | 'engaged' | 'power';
  };
  behaviorStats: {
    totalCompletedSessions: number;
    studyUsageRatio: number;
    deepWorkUsageRatio: number;
    learningUsageRatio: number;
    projectFocusUsageRatio: number;
    structuredExecutionUsageRatio: number;
    bossChallengeEngagement: 'none' | 'low' | 'medium' | 'high';
    coachInteractions: number;
    comebackSessions: number;
    ignoredFeatures: string[];
    premiumFeatureAttempts: string[];
    completionStreak: number;
  };
}

interface SessionEntry {
  status?: string;
  duration?: number;
  effectiveDuration?: number;
  mode?: string;
  endedAt?: number;
  startTime?: number;
  focusQuality?: number;
  config?: { sessionMode?: string; studyPlanId?: string };
}

interface ActiveBossData {
  id?: string;
  name?: string;
  maxHealth?: number;
  damageTaken?: number;
  encounters?: number;
  currentHealth?: number;
}

interface ActiveStudyPlanData {
  id?: string;
  title?: string;
}

interface ComebackQueryData {
  isComeback?: boolean;
  streakRestoreEligible?: boolean;
}

interface LegacySessionData {
  endedAt?: number;
}

export function useHomeResolvedExperience(controller: HomeController): HomeResolvedExperience {
  const explicitStyle = useOnboardingStore((s) => s.explicitMotivationStyle);
  const goal = useOnboardingStore((s) => s.goal);
  const onboarded = useOnboardingStore((s) => s.isOnboarded);

  const totalCompletedSessions = controller.disclosure.inputs.totalCompletedSessions;
  const features = controller.disclosure.features;

  const motivationStyle = normalizeMotivationStyle(explicitStyle);
  const primaryGoal = resolvePrimaryGoal(goal);

  const activeBossData = controller.activeBossQuery?.data as ActiveBossData | null;
  const activeStudyPlanData = controller.activeStudyPlanQuery?.data as ActiveStudyPlanData | null;
  const hasActiveBoss = activeBossData != null;
  const hasActiveStudyPlan = activeStudyPlanData != null;
  const hasActiveRecommendation = Boolean(controller.primaryRecommendation);

  const startedAt = useOnboardingStore.getState().startedAt;
  const daysSinceOnboarding = onboarded && startedAt != null
    ? computeDaysSinceTimestamp(typeof startedAt === 'number' ? startedAt : Date.now())
    : 0;
  const latestSession = controller.latestSession as LegacySessionData | null;
  const latestEndedAt = latestSession?.endedAt;
  const daysSinceLastSession = latestEndedAt != null ? computeDaysSinceTimestamp(latestEndedAt) : null;

  const sessionHistory = (controller.historyQuery as unknown as { history?: SessionEntry[] }).history ?? [];
  const completedSessions = sessionHistory.filter((s) => s.status === 'COMPLETED');
  const abandonedSessions = sessionHistory.filter((s) => s.status === 'ABANDONED');

  const featureAvailability: FeatureAvailabilitySnapshot = {
    boss: Boolean(features.boss_tab?.isUnlocked),
    challenges: Boolean(features.challenges?.isUnlocked),
    premium: Boolean(features.premium_paywall?.isUnlocked),
    study: Boolean(features.content_study?.isUnlocked),
  };

  const resolvedBehaviorSignals = useMemo(() => {
    const recentSignals: BehaviorSignal[] = getBehaviorSignals(controller.userId, {
      maxAgeMs: 7 * 24 * 60 * 60 * 1000,
      maxSignals: 20,
    });
    const studySessionCount = completedSessions.filter(
      (s) => s.mode === 'STUDY' || s.config?.sessionMode === 'STUDY' || Boolean(s.config?.studyPlanId),
    ).length;
    const deepWorkCount = completedSessions.filter(
      (s) => s.mode === 'DEEP_WORK' || s.config?.sessionMode === 'DEEP_WORK',
    ).length;
    const learningCount = completedSessions.filter(
      (s) => s.mode === 'LEARNING' || s.config?.sessionMode === 'LEARNING',
    ).length;
    const creativeCount = completedSessions.filter(
      (s) => s.mode === 'CREATIVE' || s.config?.sessionMode === 'CREATIVE',
    ).length;

    const resolverInput: BehaviorResolverInput = {
      recentSignals,
      recentSessions: {
        completedSessions: completedSessions.length,
        studySessions: studySessionCount,
        deepWorkSessions: deepWorkCount,
        learningSessions: learningCount,
        creativeSessions: creativeCount,
        totalSessions: sessionHistory.length,
        preferredMode: computePreferredMode(completedSessions),
        bestTimeOfDay: computeBestTimeOfDay(completedSessions),
      },
      firstWeekExperience: {
        stage: totalCompletedSessions === 0 ? 'DAY_0_NOT_STARTED' : 'POST_DAY_7',
        isDayZero: totalCompletedSessions === 0,
      },
    };
    return resolveUserBehaviorSignals(resolverInput);
  }, [controller.userId, completedSessions, sessionHistory, totalCompletedSessions]);

  const behaviorStats: BehaviorStats = {
    totalCompletedSessions,
    abandonedSessionDurations: computeAbandonedDurations(abandonedSessions),
    bossChallengeEngagement: resolvedBehaviorSignals.bossEngagement as 'none' | 'low' | 'medium' | 'high',
    coachInteractions: Math.max(computeCoachInteractions(controller), resolvedBehaviorSignals.coachInteractions),
    comebackSessions: computeComebackSessions(controller),
    completedSessionDurations: computeCompletedDurations(completedSessions),
    completionStreak: controller.currentStreak,
    ignoredFeatures: resolvedBehaviorSignals.ignoredFeatures,
    mostSuccessfulTimeOfDay: resolvedBehaviorSignals.mostSuccessfulTimeOfDay ?? computeBestTimeOfDay(completedSessions),
    preferredSessionMode: (resolvedBehaviorSignals.preferredSessionMode as ValidSessionMode | null) ?? computePreferredMode(completedSessions),
    premiumFeatureAttempts: resolvedBehaviorSignals.premiumFeatureAttempts,
    studyUsageRatio: resolvedBehaviorSignals.studyUsageRatio > 0
      ? resolvedBehaviorSignals.studyUsageRatio
      : computeStudyUsageRatio(completedSessions, totalCompletedSessions),
  };

  const vexInput: VexExperienceRuntimeInput = { behaviorStats, featureAvailability };
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

  const userStage: 'new' | 'activating' | 'engaged' | 'power' = (
    totalCompletedSessions === 0 ? 'new'
    : totalCompletedSessions < 3 ? 'activating'
    : totalCompletedSessions < 10 ? 'engaged' : 'power'
  );

  const canonicalProfile = useMemo(() => ({
    motivationStyle,
    primaryGoal,
    gamificationIntensity: (
      motivationStyle === 'game_like' || motivationStyle === 'intense' ? 'strong'
      : motivationStyle === 'calm' ? 'minimal' : 'medium'
    ) as 'minimal' | 'medium' | 'strong',
    studyLayerName: firstWeekExperience.studyLayerLabel,
    userStage,
  }), [motivationStyle, primaryGoal, firstWeekExperience.studyLayerLabel, userStage]);

  const canonicalBehavior = useMemo(() => ({
    totalCompletedSessions,
    studyUsageRatio: behaviorStats.studyUsageRatio,
    deepWorkUsageRatio: resolvedBehaviorSignals.deepWorkUsageRatio,
    learningUsageRatio: resolvedBehaviorSignals.learningUsageRatio,
    projectFocusUsageRatio: resolvedBehaviorSignals.projectFocusUsageRatio,
    structuredExecutionUsageRatio: resolvedBehaviorSignals.structuredExecutionUsageRatio,
    bossChallengeEngagement: behaviorStats.bossChallengeEngagement,
    coachInteractions: behaviorStats.coachInteractions,
    comebackSessions: behaviorStats.comebackSessions,
    ignoredFeatures: behaviorStats.ignoredFeatures,
    premiumFeatureAttempts: behaviorStats.premiumFeatureAttempts,
    completionStreak: behaviorStats.completionStreak,
  }), [totalCompletedSessions, behaviorStats, resolvedBehaviorSignals]);

  return useMemo(() => ({
    resolvedExperience,
    firstWeekExperience,
    personalizationProfile: canonicalProfile,
    behaviorStats: canonicalBehavior,
  }), [resolvedExperience, firstWeekExperience, canonicalProfile, canonicalBehavior]);
}
