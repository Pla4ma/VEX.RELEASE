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

    const studySessions = completedSessions.filter(
      (s) => s.mode === 'STUDY' || s.config?.sessionMode === 'STUDY' || Boolean(s.config?.studyPlanId),
    ).length;

    const deepWorkSessions = completedSessions.filter(
      (s) => s.mode === 'DEEP_WORK' || s.config?.sessionMode === 'DEEP_WORK',
    ).length;

    const learningSessions = completedSessions.filter(
      (s) => s.mode === 'LEARNING' || s.config?.sessionMode === 'LEARNING',
    ).length;

    const creativeSessions = completedSessions.filter(
      (s) => s.mode === 'CREATIVE' || s.config?.sessionMode === 'CREATIVE',
    ).length;

    const resolverInput: BehaviorResolverInput = {
      recentSignals,
      recentSessions: {
        completedSessions: completedSessions.length,
        studySessions,
        deepWorkSessions,
        learningSessions,
        creativeSessions,
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
    preferredSessionMode: resolvedBehaviorSignals.preferredSessionMode as ValidSessionMode | null ?? computePreferredMode(completedSessions),
    premiumFeatureAttempts: resolvedBehaviorSignals.premiumFeatureAttempts,
    studyUsageRatio: resolvedBehaviorSignals.studyUsageRatio > 0
      ? resolvedBehaviorSignals.studyUsageRatio
      : computeStudyUsageRatio(completedSessions, totalCompletedSessions),
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

  const canonicalProfile = useMemo(() => ({
    motivationStyle,
    primaryGoal,
    gamificationIntensity: (
      motivationStyle === 'game_like' || motivationStyle === 'intense' ? 'strong'
      : motivationStyle === 'calm' ? 'minimal' : 'medium'
    ) as 'minimal' | 'medium' | 'strong',
    studyLayerName: firstWeekExperience.studyLayerLabel,
    userStage: totalCompletedSessions === 0 ? 'new'
      : totalCompletedSessions < 3 ? 'activating'
      : totalCompletedSessions < 10 ? 'engaged' : 'power',
  } as const), [motivationStyle, primaryGoal, firstWeekExperience.studyLayerLabel, totalCompletedSessions]);

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
  } as const), [totalCompletedSessions, behaviorStats, resolvedBehaviorSignals]);

  return useMemo(() => ({
    resolvedExperience,
    firstWeekExperience,
    personalizationProfile: canonicalProfile,
    behaviorStats: canonicalBehavior,
  }), [resolvedExperience, firstWeekExperience, canonicalProfile, canonicalBehavior]);
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
    case 'LEARNING': return 'learning';
    case 'PERSONAL': return 'personal';
    default: return 'focus';
  }
}

function computeDaysSinceTimestamp(ts: number): number {
  return Math.max(0, Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24)));
}

function computeCompletedDurations(sessions: SessionEntry[]): number[] {
  return sessions
    .map((s) => s.effectiveDuration ?? s.duration ?? 0)
    .filter((d) => d > 0);
}

function computeAbandonedDurations(sessions: SessionEntry[]): number[] {
  return sessions
    .map((s) => s.effectiveDuration ?? s.duration ?? 0)
    .filter((d) => d > 0);
}

const VALID_SESSION_MODES = ['FOCUS', 'STUDY', 'DEEP_WORK', 'SPRINT', 'CREATIVE', 'RECOVERY'] as const;
type ValidSessionMode = typeof VALID_SESSION_MODES[number];

function computePreferredMode(sessions: SessionEntry[]): ValidSessionMode | null {
  const recent = sessions.slice(-10);
  if (recent.length === 0) return null;
  const modeCounts = new Map<string, number>();
  for (const s of recent) {
    const mode = s.mode ?? s.config?.sessionMode;
    if (mode) {
      modeCounts.set(mode, (modeCounts.get(mode) ?? 0) + 1);
    }
  }
  if (modeCounts.size === 0) return null;
  const entries = Array.from(modeCounts.entries()).sort((a, b) => b[1] - a[1]);
  const best = entries[0]?.[0];
  if (!best) return null;
  return (VALID_SESSION_MODES as readonly string[]).includes(best)
    ? (best as ValidSessionMode)
    : null;
}

function computeBestTimeOfDay(sessions: SessionEntry[]): string | null {
  const qualitySessions = sessions.filter(
    (s) => typeof s.focusQuality === 'number' && typeof s.startTime === 'number',
  );
  if (qualitySessions.length < 3) return null;

  qualitySessions.sort((a, b) => (b.focusQuality ?? 0) - (a.focusQuality ?? 0));
  const top = qualitySessions.slice(0, Math.min(3, qualitySessions.length));
  const avgHour = top.reduce((sum, s) => {
    const date = new Date((s.startTime ?? 0) * 1000);
    return sum + date.getHours();
  }, 0) / top.length;

  const hour = Math.round(avgHour);
  if (hour < 6) return 'early_morning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function computeStudyUsageRatio(
  completedSessions: SessionEntry[],
  totalCompleted: number,
): number {
  if (totalCompleted === 0 || completedSessions.length === 0) return 0;
  const studySessions = completedSessions.filter(
    (s) =>
      s.mode === 'STUDY' ||
      s.config?.sessionMode === 'STUDY' ||
      Boolean(s.config?.studyPlanId),
  );
  return Math.min(1, studySessions.length / totalCompleted);
}

function computeCoachInteractions(controller: HomeController): number {
  let count = 0;
  if (controller.primaryRecommendation) count += 1;
  const recsData = controller.recommendationsQuery?.data as
    | { items?: Array<{ status?: string }> }
    | Array<{ status?: string }>
    | undefined;
  if (recsData) {
    const items = Array.isArray(recsData) ? recsData : recsData.items ?? [];
    count += items.filter((r) => r.status === 'ACCEPTED').length;
  }
  return count;
}

function computeBossEngagement(
  controller: HomeController,
  hasActiveBoss: boolean,
): 'none' | 'low' | 'medium' | 'high' {
  if (!hasActiveBoss) return 'none';
  const bossData = controller.activeBossQuery?.data as
    | { damageTaken?: number; maxHealth?: number; encounters?: number }
    | undefined;
  if (!bossData) return 'low';
  const encounterCount = bossData.encounters ?? 0;
  if (encounterCount >= 3) return 'high';
  if (encounterCount >= 1) return 'medium';
  return 'low';
}

function computeComebackSessions(controller: HomeController): number {
  const comebackData = controller.comebackQuery?.data as
    { isComeback?: boolean; streakRestoreEligible?: boolean } | undefined;
  if (!comebackData?.streakRestoreEligible) return 0;
  const history = (controller.historyQuery as unknown as { history: Array<{ status: string }> }).history;
  return history?.filter((e) => e.status === 'COMPLETED').length ?? 0;
}
