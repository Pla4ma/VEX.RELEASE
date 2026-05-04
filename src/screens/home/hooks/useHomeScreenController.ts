import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCreateRecommendation, useUpdateRecommendationStatus, type SessionRecommendation } from '../../../features/ai-coach';
import * as coachRepository from '../../../features/ai-coach/repository';
import { battlePassKeys } from '../../../features/battle-pass/hooks';
import * as battlePassService from '../../../features/battle-pass/service';
import { useActiveStudyPlan } from '../../../features/content-study';
import { useWallet } from '../../../features/economy/hooks';
import { useActiveBoss } from '../../../features/boss/hooks';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { useDisclosureAnalytics, useFeatureAccess } from '../../../features/liveops-config';
import { getNextBestAction } from '../../../features/progression';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { seasonKeys } from '../../../features/seasons/hooks';
import * as seasonService from '../../../features/seasons/service';
import { useComebackState, useStreakSummary } from '../../../features/streaks/hooks';
import { useUserSquads } from '../../../features/squads/hooks';
import { useNetInfo } from '../../../network';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { useSessionHistory } from '../../../session/hooks/useSession';
import { useAuthStore } from '../../../store';
import { useSessionUIStore } from '../../../store/session-state';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { buildDisplayedReturnReason, getFocusedMinutesForToday, getNextUnlockFeature } from './home-controller-helpers';
import { useHomeAnalyticsEffects } from './useHomeAnalyticsEffects';
import { useHomeNavigationActions } from './useHomeNavigationActions';
import { useHomeReturnReason } from './useHomeReturnReason';
type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export function useHomeScreenController() {
  const navigation = useNavigation<Nav>();
  const { isOnline } = useNetInfo();
  const { user } = useAuthStore();
  const homeHighlight = useSessionUIStore((state) => state.homeHighlight);
  const clearHomeHighlight = useSessionUIStore((state) => state.clearHomeHighlight);
  const userId = user?.id ?? '';
  const disclosure = useFeatureAccess();
  const analytics = useDisclosureAnalytics();
  const streakQuery = useStreakSummary(userId);
  const progressionQuery = useProgressionSummary(userId);
  const historyQuery = useSessionHistory(userId, 5);
  const squadsQuery = useUserSquads(userId || undefined, { staleTime: 1000 * 60 * 5 });
  const activeStudyPlanQuery = useActiveStudyPlan();
  const walletQuery = useWallet(userId);
  const comebackQuery = useComebackState(userId);
  const activeBossQuery = useActiveBoss(userId || null);
  const createRecommendation = useCreateRecommendation();
  const updateRecommendationStatus = useUpdateRecommendationStatus();

  const activeSeasonQuery = useQuery({
    queryKey: seasonKeys.active(),
    queryFn: () => seasonService.getActiveSeason(),
    staleTime: 1000 * 60 * 10,
  });
  const battlePassQuery = useQuery({
    queryKey: battlePassKeys.userSummary(userId, activeSeasonQuery.data?.id ?? ''),
    queryFn: () => battlePassService.getUserBattlePassSummary(userId, activeSeasonQuery.data?.id ?? ''),
    enabled: Boolean(userId && activeSeasonQuery.data?.id && !activeSeasonQuery.isLoading),
    staleTime: 1000 * 60 * 2,
  });

  const currentStreak = streakQuery.data?.currentDays ?? 0;
  const currentXp = progressionQuery.data?.xp ?? 0;
  const latestSession = historyQuery.history[0] ?? null;
  const todayFocusMinutes = historyQuery.history.reduce((sum, entry) => sum + getFocusedMinutesForToday(entry), 0);
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const shouldShowSecondarySystems = disclosure.productTier !== 'CORE';
  const shouldShowExpansionSystems = disclosure.productTier === 'EXPANSION';
  const nextUnlockFeature = useMemo(
    () => getNextUnlockFeature(disclosure.features),
    [disclosure.features],
  );
  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak,
    nextUnlockFeature,
  });

  const isCoreLoading =
    disclosure.isLoading ||
    activeSeasonQuery.isLoading ||
    battlePassQuery.isLoading ||
    activeStudyPlanQuery.isLoading;
  const recommendationsQuery = useQuery({
    queryKey: ['coach', 'recommendations', userId],
    queryFn: () => coachRepository.fetchActiveRecommendations(userId),
    enabled: Boolean(userId) && !isCoreLoading,
    staleTime: 1000 * 60 * 5,
  });
  const primaryRecommendation = useMemo<SessionRecommendation | null>(
    () =>
      (recommendationsQuery.data ?? [])
        .filter((item) => item.status === 'ACTIVE' && item.expiresAt > Date.now())
        .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] ?? null,
    [recommendationsQuery.data],
  );

  const isLoading = isCoreLoading || recommendationsQuery.isLoading;
  const loadError = disclosure.error ?? activeStudyPlanQuery.error ?? comebackQuery.error;
  const isFirstRun = !isLoading && disclosure.inputs.totalCompletedSessions === 0 && currentStreak === 0 && currentXp === 0;

  useHomeAnalyticsEffects({
    analytics,
    features: disclosure.features,
    stage: disclosure.stage,
    totalCompletedSessions: disclosure.inputs.totalCompletedSessions,
    userId,
  });

  const {
    continueStudyPlan,
    openContentStudy,
    openNextAction,
    openProgress,
    openSetup,
    openSocial,
  } = useHomeNavigationActions({
    activeStudyPlan: activeStudyPlanQuery.data
      ? {
          contentId: activeStudyPlanQuery.data.contentId,
          generationId: activeStudyPlanQuery.data.generationId,
        }
      : null,
    analytics,
    completedSessions: disclosure.inputs.totalCompletedSessions,
    navigation,
    stage: disclosure.stage,
    userId,
  });

  const { returnReason } = useHomeReturnReason({
    activeStudyPlan: activeStudyPlanQuery.data ?? null,
    canShowExpansionSystems: shouldShowExpansionSystems,
    comebackMessage: comebackQuery.data?.isComeback ? comebackQuery.data.message : null,
    createRecommendation,
    currentLevel: progressionQuery.data?.level ?? 1,
    currentStreak,
    latestSessionEndedAt: latestSession?.endedAt ?? null,
    nextBestAction,
    onContinueStudyPlan: continueStudyPlan,
    openNextAction,
    openSetup,
    primaryRecommendation,
    recommendationsLoading: recommendationsQuery.isLoading,
    updateRecommendationStatus,
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
    returnReason: {
      body: returnReason.body,
      ctaLabel: returnReason.ctaLabel,
      eyebrow: returnReason.eyebrow,
      intent: returnReason.intent,
      source: returnReason.source,
      title: returnReason.title,
      tone: returnReason.tone,
    },
    todayFocusMinutes,
  });
  const displayedReturnReason = useMemo(
    () => buildDisplayedReturnReason(homeSpine.returnReason, returnReason),
    [homeSpine.returnReason, returnReason],
  );

  return {
    user,
    userId,
    isOnline,
    isLoading,
    isFirstRun,
    loadError,
    homeHighlight,
    clearHomeHighlight,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    latestSession,
    primaryRecommendation,
    homeSpine,
    returnReason: displayedReturnReason,
    disclosure,
    streakQuery,
    progressionQuery,
    historyQuery,
    squadsQuery,
    activeSeasonQuery,
    battlePassQuery,
    activeStudyPlanQuery,
    walletQuery,
    comebackQuery,
    activeBossQuery,
    shouldShowSecondarySystems,
    shouldShowExpansionSystems,
    openSetup,
    openProgress,
    openSocial,
    openContentStudy,
    continueStudyPlan,
    retryAll: disclosure.refetchAll,
  };
}
