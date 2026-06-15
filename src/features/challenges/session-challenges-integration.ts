/**
 * Session Challenges Integration
 *
 * Integrates session completion with basic challenges progress.
 * Listens for session completion events and updates challenge progress.
 */

import { eventBus } from '../../events/EventBus';
import {
  useBasicChallengesStatus,
  challengesKeys,
} from '../challenges/hooks/basic-challenges-hooks';
import { useUpdateBasicChallengeProgress } from '../challenges/hooks/basic-challenges-mutations';
import type { BasicChallengeProgressResult } from '../challenges/basic-challenges-service';
import { useEffect } from 'react';
import { createDebugger } from '../../utils/debug';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';

const debug = createDebugger('challenges:session-integration');
const FEATURE_KEY = 'challenges' as const;

// ============================================================================
// Session to Challenges Progress Integration
// ============================================================================

export function useSessionChallengesIntegration() {
  const progressMutation = useUpdateBasicChallengeProgress(challengesKeys);

  useEffect(() => {
    // Listen for session completion events
    const unsubscribe = eventBus.subscribe(
      'session:completed',
      async (event) => {
        const availability = getAvailabilityFor(FEATURE_KEY);
        if (!availability.canSubscribeToEvents) {return;}

        const { sessionId, duration } = event;

        try {
          // Update challenge progress based on session completion
          const result: BasicChallengeProgressResult =
            await progressMutation.mutateAsync({
              sessionId: sessionId as string,
              sessionDuration: duration as number,
            });

          debug.debug(
            'Updated challenge progress from session %s daily=%s weekly=%s dailyComplete=%s weeklyComplete=%s',
            sessionId,
            String(result.dailyUpdated),
            String(result.weeklyUpdated),
            String(result.dailyCompleted),
            String(result.weeklyCompleted),
          );
        } catch (error) {
          debug.error(
            'Failed to update challenge progress from session',
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      },
    );

    return unsubscribe;
  }, [progressMutation]);
}

// ============================================================================
// Challenge Status for Session Setup
// ============================================================================

export function useChallengeStatusForSession() {
  const statusQuery = useBasicChallengesStatus();

  return {
    dailyChallengeProgress: statusQuery.data?.daily.progress ?? 0,
    dailyChallengeRequired: statusQuery.data?.daily.required ?? 1,
    dailyChallengeCompleted: statusQuery.data?.daily.isCompleted ?? false,
    weeklyChallengeProgress: statusQuery.data?.weekly.progress ?? 0,
    weeklyChallengeRequired: statusQuery.data?.weekly.required ?? 5,
    weeklyChallengeCompleted: statusQuery.data?.weekly.isCompleted ?? false,
    hasActiveChallenges: !!(
      statusQuery.data?.daily.hasActiveChallenge ||
      statusQuery.data?.weekly.hasActiveChallenge
    ),
    canCompleteDailyChallenge:
      statusQuery.data?.daily.hasActiveChallenge &&
      !statusQuery.data?.daily.isCompleted,
    canCompleteWeeklyChallenge:
      statusQuery.data?.weekly.hasActiveChallenge &&
      !statusQuery.data?.weekly.isCompleted,
  };
}

// ============================================================================
// Challenge Progress Calculation Helper
// ============================================================================

export function calculateChallengeContribution(sessionData: {
  durationSeconds: number;
  qualityScore: number;
}): {
  dailyContribution: number;
  weeklyContribution: number;
  canCompleteDaily: boolean;
  canCompleteWeekly: boolean;
} {
  sessionData;
  const dailyContribution = 1; // Each session contributes 1 to daily challenge
  const weeklyContribution = 1; // Each session contributes 1 to weekly challenge

  return {
    dailyContribution,
    weeklyContribution,
    canCompleteDaily: dailyContribution >= 1,
    canCompleteWeekly: weeklyContribution >= 5, // Need 5 sessions for weekly
  };
}

// ============================================================================
// Challenge CTA (Call to Action) Helper
// ============================================================================

export function getChallengeCTA(challengeStatus: {
  dailyProgress: number;
  dailyRequired: number;
  dailyCompleted: boolean;
  weeklyProgress: number;
  weeklyRequired: number;
  weeklyCompleted: boolean;
}): {
  primaryCTA: string;
  secondaryCTA: string | null;
  motivationMessage: string;
} {
  const {
    dailyProgress,
    dailyRequired,
    dailyCompleted,
    weeklyProgress,
    weeklyRequired,
    weeklyCompleted,
  } = challengeStatus;

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
