/**
 * useHomeData Hook
 *
 * Consolidates all data fetching and derived state for HomeScreen.
 */

import { useMemo, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useActiveChallenges,
  useClaimChallengeReward,
} from '../../../features/challenges/hooks';
import { useSquadMembersFocusing } from '../../../features/squads/hooks';
import { useFreezeStreak } from '../../../features/streaks/hooks';
import {
  useBountyStatus,
  usePlaceBounty,
} from '../../../features/boss/hooks';
import { useSavedTomorrowPreview } from '../../../features/home-spine/hooks';
import { useActiveIntervention } from '../../../features/ai-coach/hooks';
import { useNotificationBadge } from '../../../features/notifications/components/NotificationBadge';
import { useToast } from '../../../shared/ui/components/Toast';
import { useHomeScreenController } from './useHomeScreenController';
import type { ChallengeItem, SessionListItem } from '../../../features/home-spine/components';
import { getQualityGrade, getHomeCompanionMood } from '../utils';

export function useHomeData() {
  const insets = useSafeAreaInsets();
  const controller = useHomeScreenController();
  const { show: showToast } = useToast();

  // Data fetching hooks
  const challengesQuery = useActiveChallenges(controller.userId);
  const claimRewardMutation = useClaimChallengeReward();
  const freezeStreakMutation = useFreezeStreak();
  const {
    intervention,
    isLoading: interventionLoading,
    dismiss: dismissIntervention,
  } = useActiveIntervention(controller.userId || undefined);

  // Boss bounty
  const activeBossQuery = controller.activeBossQuery;
  const bountyStatusQuery = useBountyStatus(
    activeBossQuery.data?.id,
    controller.userId || undefined
  );
  const placeBountyMutation = usePlaceBounty();

  // Tomorrow preview
  const savedPreview = useSavedTomorrowPreview(controller.userId ?? '');
  const displayedInterventionIdRef = useRef<string | null>(null);

  // Squad members focusing
  const squadMembersFocusing = useSquadMembersFocusing(controller.userId || undefined);

  // Notification badge
  const { count: unreadNotificationCount } = useNotificationBadge(controller.userId);

  // Derived state
  const todaysChallenges: ChallengeItem[] = useMemo(() => {
    if (!challengesQuery.data) {return [];}
    return challengesQuery.data
      .filter((item) => item.challenge.type === 'DAILY')
      .slice(0, 3)
      .map((item) => ({
        id: item.userChallenge.id,
        title: item.challenge.title,
        description: item.challenge.description,
        currentProgress: item.userChallenge.currentValue,
        targetProgress: item.challenge.targetValue,
        rewardAmount: item.challenge.rewardAmount,
        rewardType: item.challenge.rewardType as 'XP' | 'COINS' | 'GEMS',
        isCompleted: item.userChallenge.status === 'COMPLETED' || item.userChallenge.status === 'CLAIMED',
        isClaimed: item.userChallenge.status === 'CLAIMED',
        timeRemainingMinutes: item.userChallenge.expiresAt
          ? Math.max(0, Math.floor((item.userChallenge.expiresAt - Date.now()) / (1000 * 60)))
          : 0,
      }));
  }, [challengesQuery.data]);

  const streakHoursRemaining = useMemo(() => {
    if (!controller.streakQuery.data?.nextDeadline) {return null;}
    return Math.max(0, Math.floor((controller.streakQuery.data.nextDeadline - Date.now()) / (1000 * 60 * 60)));
  }, [controller.streakQuery.data?.nextDeadline]);

  const hasActiveSession = useMemo(() => {
    const latest = controller.historyQuery.history[0];
    if (!latest) {return false;}
    return latest.status === 'ACTIVE' || latest.status === 'PAUSED';
  }, [controller.historyQuery.history]);

  const resumeTimeSeconds = useMemo(() => {
    if (!hasActiveSession) {return null;}
    const latest = controller.historyQuery.history[0];
    if (!latest) {return null;}
    if (latest.endedAt && latest.startedAt) {
      return Math.floor((latest.endedAt - latest.startedAt) / 1000);
    }
    return null;
  }, [hasActiveSession, controller.historyQuery.history]);

  const recentSessions = useMemo<SessionListItem[]>(() => {
    return controller.historyQuery.history.flatMap((entry) => {
      if (!entry.endedAt || !entry.startedAt) {return [];}
      const durationSeconds = Math.max(0, Math.floor((entry.endedAt - entry.startedAt) / 1000));
      const summary = entry.summary;
      return [{
        id: entry.sessionId,
        duration: durationSeconds,
        qualityGrade: getQualityGrade(summary?.focusPurityScore ?? summary?.focusQuality ?? 0),
        xpEarned: summary?.xpEarned ?? 0,
        endedAt: new Date(entry.endedAt).toISOString(),
        interruptions: summary?.interruptions ?? 0,
      }];
    }).slice(0, 5);
  }, [controller.historyQuery.history]);

  const comebackSessionsCompleted = useMemo(() => {
    if (!controller.comebackQuery.data?.streakRestoreEligible) {return 0;}
    return controller.historyQuery.history.filter((entry) => entry.status === 'COMPLETED').length;
  }, [controller.comebackQuery.data?.streakRestoreEligible, controller.historyQuery.history]);

  const companionMood = useMemo(
    () => getHomeCompanionMood(controller.historyQuery.history, controller.currentStreak),
    [controller.currentStreak, controller.historyQuery.history]
  );

  // Handlers
  const handleClaimReward = useCallback((challengeId: string) => {
    if (!controller.userId) {
      showToast({
        type: 'error',
        title: 'Sign in required',
        message: 'You need an active profile to claim challenge rewards.',
      });
      return;
    }

    claimRewardMutation.mutate(
      { userId: controller.userId, challengeId },
      {
        onSuccess: (result) => {
          const rewardText = result.rewards
            .map((reward) => `+${reward.amount} ${reward.type}`)
            .join(', ');
          showToast({
            type: 'success',
            title: `Reward claimed! ${rewardText}`,
          });
        },
        onError: (error) => {
          showToast({
            type: 'error',
            title: 'Reward claim failed',
            message: error instanceof Error ? error.message : 'Try again when your connection is stable.',
            action: {
              label: 'Retry',
              onPress: () => handleClaimReward(challengeId),
            },
          });
        },
      }
    );
  }, [claimRewardMutation, controller.userId, showToast]);

  const handleFreezeStreak = useCallback(() => {
    if (!controller.userId) {return;}
    freezeStreakMutation.mutate(controller.userId, {
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Streak protected',
          message: 'Your streak freeze is active for today.',
        });
      },
      onError: (error) => {
        showToast({
          type: 'error',
          title: 'Could not freeze streak',
          message: error instanceof Error ? error.message : 'Try again before your streak expires.',
        });
      },
    });
  }, [controller.userId, freezeStreakMutation, showToast]);

  // Daily Dungeon data from master orchestrator
  const dailyDungeon = useMemo(() => {
    if (!controller.userId) {return null;}
    // Access master orchestrator through controller or create mock data for now
    return {
      dungeon: {
        id: `dungeon_${new Date().toISOString().split('T')[0]}`,
        date: new Date().toISOString().split('T')[0],
        bossName: 'Procrastination Demon',
        theme: 'VOID',
        specialMechanic: 'DISTRACTION_FIELDS',
        guaranteedDrop: { type: 'CHEST', rarity: 'RARE', amount: 1 },
      },
      attempt: {
        userId: controller.userId,
        dungeonId: `dungeon_${new Date().toISOString().split('T')[0]}`,
        completed: false,
        score: 0,
      },
      timeRemaining: {
        hours: Math.max(0, 24 - new Date().getHours()),
        minutes: 60 - new Date().getMinutes(),
      },
    };
  }, [controller.userId]);

  return {
    insets,
    controller,
    showToast,
    // Data queries
    challengesQuery,
    claimRewardMutation,
    freezeStreakMutation,
    intervention,
    interventionLoading,
    dismissIntervention,
    activeBossQuery,
    bountyStatusQuery,
    placeBountyMutation,
    savedPreview,
    displayedInterventionIdRef,
    squadMembersFocusing,
    unreadNotificationCount,
    // Derived state
    todaysChallenges,
    streakHoursRemaining,
    hasActiveSession,
    resumeTimeSeconds,
    recentSessions,
    comebackSessionsCompleted,
    companionMood,
    dailyDungeon,
    // Handlers
    handleClaimReward,
    handleFreezeStreak,
  };
}
