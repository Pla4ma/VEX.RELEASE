import { useCallback, useEffect, useState } from 'react';

import { useProgressionSummary } from '../../../features/progression/hooks';
import type { SessionSummary } from '../../../session/types';
import type { HeadlineReward } from '../../../features/session-completion/headline-reward.schemas';
import { useSessionRewardSync } from './useSessionRewardSync';
type ProgressionSummaryData = NonNullable<
  ReturnType<typeof useProgressionSummary>['data']
>;

// Mock functions for applyChestRewards and creditSessionRewards
const applyChestRewards = async (_input: { sessionId: string; rewards: HeadlineReward[] }) => {
  // In archived economy system, this would call the progression service
};

const creditSessionRewards = async (_userId: string, rewards: HeadlineReward[]) => {
  // In archived economy system, this would call the progression service
  return rewards;
};

export function useSessionCompleteRewards({
  applySessionMastery,
  focusedDuration,
  focusPurityScore,
  primarySquadId,
  progressionSummary,
  refetchProgressionSummary,
  sessionId,
  streakMultiplier,
  summary,
  userId,
  showToast,
}: {
  applySessionMastery: (input: {
    focusPurityScore: number;
    focusedDuration: number;
    interruptions: number;
    isMounted: boolean;
    streakDays: number;
  }) => unknown;
  focusedDuration: number;
  focusPurityScore: number;
  primarySquadId: string | null;
  progressionSummary: ProgressionSummaryData | undefined;
  refetchProgressionSummary: () => Promise<ProgressionSummaryData | undefined>;
  sessionId: string;
  streakMultiplier: number;
  summary: SessionSummary;
  userId: string;
  showToast: (input: {
    duration: number;
    message: string;
    title: string;
    type: 'error' | 'success';
  }) => void;
}) {
  const [completionStage, setCompletionStage] = useState(0);

  const syncedRewardState = useSessionRewardSync({
    applySessionMastery,
    focusPurityScore,
    focusedDuration,
    primarySquadId,
    progressionSummary,
    refetchProgressionSummary,
    showToast,
    streakMultiplier,
    summary,
    userId,
    applyChestRewards,
    creditSessionRewards,
  });
  const handleRevealComplete = useCallback(async (): Promise<void> => {
    setCompletionStage(2);
    await syncedRewardState.actions.applyCompletionRewards();
  }, [syncedRewardState.actions]);

  useEffect(() => {
    const completionTimer = setTimeout(() => setCompletionStage(1), 1200);

    return () => {
      clearTimeout(completionTimer);
    };
  }, []);

  return {
    actions: {
      ...syncedRewardState.actions,
      handleRevealComplete,
    },
    levelUpCelebration: syncedRewardState.levelUpCelebration,
    rewardCreditError: syncedRewardState.rewardCreditError,
    rewardCreditStatus: syncedRewardState.rewardCreditStatus,
    completionStage,
    showCtas: completionStage >= 2,
  };
}
