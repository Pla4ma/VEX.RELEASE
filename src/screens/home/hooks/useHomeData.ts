import { useMemo, useRef } from 'react';
import { useActiveChallenges } from '../../../features/challenges/hooks/challengeQueries';
import { useSavedTomorrowPreview } from '../../../features/home-spine/hooks';
import { useActiveIntervention } from '../../../features/ai-coach/hooks/useActiveIntervention';
import { useNotificationBadge } from '../../../features/notifications/components/NotificationBadge';
import { useToast } from '../../../shared/ui/components/Toast';
import type { HomeController } from './home-controller-types';
import type { ChallengeItem, SessionListItem } from '../../../features/home-spine/components';
import { getQualityGrade, getHomeCompanionMood } from '../../../screens/home/utils';
import { useHomeDataHandlers } from './useHomeDataHandlers';

interface UseHomeDataInput {
  controller: HomeController;
}

export function useHomeData(input: UseHomeDataInput) {
  const { controller } = input;
  const { show: showToast } = useToast();
  const challengesQuery = useActiveChallenges(controller.userId, {
    enabled: controller.runtime.canQueryChallenges,
  });
  const {
    intervention,
    isLoading: interventionLoading,
    dismiss: dismissIntervention,
  } = useActiveIntervention(
    controller.runtime.canQueryCoach
      ? controller.userId || undefined
      : undefined,
  );
  const savedPreview = useSavedTomorrowPreview(controller.userId ?? '');
  const displayedInterventionIdRef = useRef<string | null>(null);
  // Stable empty array via useMemo (deps=[]) so consumer memoization holds
  // without violating the AGENTS.md "no `as` casts" rule. Keeps the value
  // inside the hook per the prefer-module-scope-static-value canonical
  // recipe's escape hatch for non-trivially-shareable mutable bindings.
  const squadMembersFocusing = useMemo<Array<Record<string, unknown>>>(
    () => [],
    [],
  );
  const { count: unreadNotificationCount } = useNotificationBadge(
    controller.runtime.canQueryNotifications ? controller.userId : undefined,
  );
  const todaysChallenges: ChallengeItem[] = useMemo(() => {
    const data = challengesQuery.data as
      | Array<{
          challenge: {
            type: string;
            title: string;
            description: string;
            targetValue: number;
            rewardAmount: number;
            rewardType: string;
          };
          userChallenge: {
            id: string;
            currentValue: number;
            status: string;
            expiresAt: number | null;
          };
        }>
      | undefined;
    if (!data) {return [];}
    return data
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
        isCompleted:
          item.userChallenge.status === 'COMPLETED' ||
          item.userChallenge.status === 'CLAIMED',
        isClaimed: item.userChallenge.status === 'CLAIMED',
        timeRemainingMinutes: item.userChallenge.expiresAt
          ? Math.max(
              0,
              Math.floor(
                (item.userChallenge.expiresAt - Date.now()) / (1000 * 60),
              ),
            )
          : 0,
      }));
  }, [challengesQuery.data]);
  const streakData = controller.streakQuery.data as
    | { nextDeadline?: number }
    | undefined;
  const streakHoursRemaining = useMemo(() => {
    if (!streakData?.nextDeadline) {return null;}
    return Math.max(
      0,
      Math.floor((streakData.nextDeadline - Date.now()) / (1000 * 60 * 60)),
    );
  }, [streakData?.nextDeadline]);
  const hasActiveSession = useMemo(() => {
    const latest = controller.historyQuery.history[0] as
      | { status?: string }
      | undefined;
    if (!latest) {return false;}
    return latest.status === 'ACTIVE' || latest.status === 'PAUSED';
  }, [controller.historyQuery.history]);
  const resumeTimeSeconds = useMemo(() => {
    if (!hasActiveSession) {return null;}
    const latest = controller.historyQuery.history[0] as
      | { endedAt?: number; startedAt?: number }
      | undefined;
    if (!latest) {return null;}
    if (latest.endedAt && latest.startedAt) {
      return Math.floor((latest.endedAt - latest.startedAt) / 1000);
    }
    return null;
  }, [hasActiveSession, controller.historyQuery.history]);
  const recentSessions: SessionListItem[] = useMemo(() => {
    return (
      controller.historyQuery.history as Array<{
        sessionId: string;
        endedAt?: number;
        startedAt?: number;
        summary?: {
          focusPurityScore?: number;
          focusQuality?: number;
          xpEarned?: number;
          interruptions?: number;
        };
      }>
    )
      .flatMap((entry) => {
        if (!entry.endedAt || !entry.startedAt) {return [];}
        const durationSeconds = Math.max(
          0,
          Math.floor((entry.endedAt - entry.startedAt) / 1000),
        );
        const summary = entry.summary;
        return [
          {
            id: entry.sessionId,
            duration: durationSeconds,
            qualityGrade: getQualityGrade(
              summary?.focusPurityScore ?? summary?.focusQuality ?? 0,
            ),
            xpEarned: summary?.xpEarned ?? 0,
            endedAt: new Date(entry.endedAt).toISOString(),
            interruptions: summary?.interruptions ?? 0,
          },
        ];
      })
      .slice(0, 5);
  }, [controller.historyQuery.history]);
  const comebackData = controller.comebackQuery.data as
    | { streakRestoreEligible?: boolean }
    | undefined;
  const comebackSessionsCompleted = useMemo(() => {
    if (!comebackData?.streakRestoreEligible) {return 0;}
    return (
      controller.historyQuery.history as Array<{ status: string }>
    ).filter((entry) => entry.status === 'COMPLETED').length;
  }, [comebackData?.streakRestoreEligible, controller.historyQuery.history]);
  const companionMood = useMemo(
    () =>
      getHomeCompanionMood(
        controller.historyQuery.history,
        controller.currentStreak,
      ),
    [controller.currentStreak, controller.historyQuery.history],
  );

  const {
    claimRewardMutation,
    freezeStreakMutation,
    handleClaimReward,
    handleFreezeStreak,
  } = useHomeDataHandlers(controller, showToast);

  return {
    controller,
    showToast,
    challengesQuery,
    claimRewardMutation,
    freezeStreakMutation,
    intervention,
    interventionLoading,
    dismissIntervention,
    savedPreview,
    displayedInterventionIdRef,
    squadMembersFocusing,
    unreadNotificationCount,
    todaysChallenges,
    streakHoursRemaining,
    hasActiveSession,
    resumeTimeSeconds,
    recentSessions,
    comebackSessionsCompleted,
    companionMood,
    handleClaimReward,
    handleFreezeStreak,
  };
}

export type HomeData = ReturnType<typeof useHomeData>;
