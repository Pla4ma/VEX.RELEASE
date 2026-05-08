/**
 * Session Challenges Integration
 *
 * Integrates session completion with basic challenges progress.
 */

import { eventBus } from '../../events';
import { useBasicChallengesStatus, useUpdateBasicChallengeProgress } from '../challenges/hooks/basic-challenges-hooks';
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';

export function useSessionChallengesIntegration() {
  const progressMutation = useUpdateBasicChallengeProgress();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', async (event) => {
      const { sessionId, duration } = event;

      try {
        await progressMutation.mutateAsync({
          sessionId,
          sessionDuration: duration,
        });

        Sentry.addBreadcrumb({
          category: 'challenges',
          message: 'Updated challenge progress from session',
          data: { sessionId },
          level: 'info',
        });
      } catch (error) {
        Sentry.addBreadcrumb({
          category: 'challenges',
          message: 'Failed to update challenge progress from session',
          data: { sessionId, error: error instanceof Error ? error.message : String(error) },
          level: 'error',
        });
        Sentry.captureException(error, { tags: { feature: 'challenges', context: 'session_integration' } });
      }
    });

    return unsubscribe;
  }, [progressMutation]);
}

export function useChallengeStatusForSession() {
  const statusQuery = useBasicChallengesStatus();

  return {
    dailyChallengeProgress: statusQuery.data?.daily.progress ?? 0,
    dailyChallengeRequired: statusQuery.data?.daily.required ?? 1,
    dailyChallengeCompleted: statusQuery.data?.daily.isCompleted ?? false,
    weeklyChallengeProgress: statusQuery.data?.weekly.progress ?? 0,
    weeklyChallengeRequired: statusQuery.data?.weekly.required ?? 5,
    weeklyChallengeCompleted: statusQuery.data?.weekly.isCompleted ?? false,
    hasActiveChallenges: !!(statusQuery.data?.daily.hasActiveChallenge || statusQuery.data?.weekly.hasActiveChallenge),
    canCompleteDailyChallenge: statusQuery.data?.daily.hasActiveChallenge && !statusQuery.data?.daily.isCompleted,
    canCompleteWeeklyChallenge: statusQuery.data?.weekly.hasActiveChallenge && !statusQuery.data?.weekly.isCompleted,
    refetch: statusQuery.refetch,
    isPending: statusQuery.isPending,
    isError: statusQuery.isError,
    error: statusQuery.error,
  };
}

export function calculateChallengeContribution(_sessionData: {
  durationSeconds: number;
  qualityScore: number;
}) {
  return {
    dailyContribution: 1,
    weeklyContribution: 1,
    canCompleteDaily: true,
    canCompleteWeekly: false, // 1 session is not enough for weekly (needs 5)
  };
}

export function getChallengeCTA(challengeStatus: {
  dailyProgress: number;
  dailyRequired: number;
  dailyCompleted: boolean;
  weeklyProgress: number;
  weeklyRequired: number;
  weeklyCompleted: boolean;
}) {
  const { dailyProgress, dailyRequired, dailyCompleted, weeklyProgress, weeklyRequired, weeklyCompleted } = challengeStatus;

  if (dailyCompleted && weeklyCompleted) {
    return {
      primaryCTA: 'Claim Rewards',
      secondaryCTA: null,
      motivationMessage: "Great job! You've completed all challenges today.",
    };
  }

  if (dailyCompleted) {
    const weeklyRemaining = weeklyRequired - weeklyProgress;
    return {
      primaryCTA: 'Complete Weekly Challenge',
      secondaryCTA: 'Claim Daily Reward',
      motivationMessage: `Daily done! ${weeklyRemaining} more session${weeklyRemaining !== 1 ? 's' : ''} for weekly.`,
    };
  }

  if (weeklyCompleted) {
    const dailyRemaining = dailyRequired - dailyProgress;
    return {
      primaryCTA: 'Complete Daily Challenge',
      secondaryCTA: 'Claim Weekly Reward',
      motivationMessage: `Weekly done! ${dailyRemaining} more session${dailyRemaining !== 1 ? 's' : ''} for daily.`,
    };
  }

  const dailyRemaining = dailyRequired - dailyProgress;
  const weeklyRemaining = weeklyRequired - weeklyProgress;

  return {
    primaryCTA: 'Start Focus Session',
    secondaryCTA: null,
    motivationMessage: `${dailyRemaining} daily, ${weeklyRemaining} weekly sessions remaining.`,
  };
}
