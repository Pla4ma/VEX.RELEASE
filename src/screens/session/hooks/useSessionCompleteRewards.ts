import { useMemo } from 'react';

import { useProgressionSummary } from '../../../features/progression/hooks';
import type { SessionSummary } from '../../../session/types';
import { useSessionCompleteChest } from './useSessionCompleteChest';
import { useSessionRewardSync } from './useSessionRewardSync';
type ProgressionSummaryData = NonNullable<
  ReturnType<typeof useProgressionSummary>['data']
>;

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
  const optimisticXpReward = useMemo(() => summary.xpEarned, [summary.xpEarned]);

  const chest = useSessionCompleteChest({
    focusedDuration,
    focusPurityScore,
    sessionId,
    summary,
    userId,
  });

  const syncedRewardState = useSessionRewardSync({
    applySessionMastery,
    chestResult: chest.chestResult,
    focusPurityScore,
    focusedDuration,
    optimisticXpReward: chest.chestResult?.xpReward ?? optimisticXpReward,
    primarySquadId,
    progressionSummary,
    refetchProgressionSummary,
    showToast,
    streakMultiplier,
    summary,
    userId,
  });

  return {
    actions: {
      ...syncedRewardState.actions,
      handleChestOpen: chest.actions.handleChestOpen,
      handleRevealComplete: () =>
        chest.actions.handleRevealComplete(
          syncedRewardState.actions.applyChestRewards,
        ),
      prepareChest: chest.actions.prepareChest,
    },
    chestError: chest.chestError,
    chestResult: chest.chestResult,
    levelUpCelebration: syncedRewardState.levelUpCelebration,
    rewardCreditError: syncedRewardState.rewardCreditError,
    rewardCreditStatus: syncedRewardState.rewardCreditStatus,
    revealStage: chest.revealStage,
    showCtas: chest.showCtas,
  };
}
