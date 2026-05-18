import { useMemo } from 'react';
import { useNetInfo } from '../../../network';
import { useFeatureAccess, useDisclosureAnalytics } from '../../../features/liveops-config';
import { useStreakSummary } from '../../../features/streaks/hooks';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { useSessionHistory } from '../../../session/hooks/useSession';
import { useAuthStore } from '../../../store';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import type { HomeViewModel } from './home-view-model';
import { buildHomeFeatureRuntime } from './home-feature-runtime';
import { getFocusedMinutesForToday } from './home-controller-helpers';
import { useHomeAnalyticsEffects } from './useHomeAnalyticsEffects';

export function useNewUserHomeModel(): HomeViewModel {
  const { isOnline } = useNetInfo();
  const { user } = useAuthStore();
  const homeHighlight = useSessionUIStore((state) => state.homeHighlight);
  const clearHomeHighlight = useSessionUIStore((state) => state.clearHomeHighlight);
  const userId = user?.id ?? '';

  const disclosure = useFeatureAccess();
  const runtime = useMemo(
    () => buildHomeFeatureRuntime(disclosure.features, disclosure.productTier),
    [disclosure.features, disclosure.productTier],
  );
  const analytics = useDisclosureAnalytics();

  const streakQuery = useStreakSummary(userId);
  const progressionQuery = useProgressionSummary(userId);
  const historyQuery = useSessionHistory(userId, 5);

  const currentStreak = streakQuery.data?.currentDays ?? 0;
  const currentXp = progressionQuery.data?.xp ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce(
    (sum, entry) => sum + getFocusedMinutesForToday(entry), 0,
  );
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun =
    !disclosure.isLoading && disclosure.inputs.totalCompletedSessions === 0 && currentStreak === 0 && currentXp === 0;

  useHomeAnalyticsEffects({
    analytics,
    features: disclosure.features as Record<string, { isUnlocked: boolean }>,
    stage: disclosure.stage,
    totalCompletedSessions: disclosure.inputs.totalCompletedSessions,
    userId,
  });

  const homeSpine = useHomeSpineModel({
    currentStreak,
    homeHighlight,
    isAtRisk: Boolean(streakQuery.data?.isAtRisk),
    isFirstRun,
    level: progressionQuery.data?.level ?? 1,
    progressPercent,
    progressXp: currentXp,
    returnReason: { body: '', ctaLabel: '', eyebrow: '', intent: 'start-session' as const, source: 'coach' as const, title: '', tone: 'default' as const },
    todayFocusMinutes,
  });

  return {
    userId,
    isOnline,
    isLoading: disclosure.isLoading,
    isFirstRun,
    loadError: disclosure.error,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    primaryRecommendation: null,
    homeSpine,
    returnReason: null,
    stage: disclosure.stage,
    productTier: disclosure.productTier,
    features: disclosure.features,
    runtime,
  };
}
