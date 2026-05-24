import { useCallback, useEffect, useState } from 'react';

import { useProgressionSummary } from '../../../features/progression/hooks';
import type { SessionSummary } from '../../../session/types';
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
  const [revealStage, setRevealStage] = useState(0);

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
  });
  const handleRevealComplete = useCallback(async (): Promise<void> => {
    setRevealStage(2);
    await syncedRewardState.actions.applyCompletionRewards();
  }, [syncedRewardState.actions]);

  useEffect(() => {
    const revealTimer = setTimeout(() => setRevealStage(1), 1200);

    return () => {
      clearTimeout(revealTimer);
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
    revealStage,
    showCtas: revealStage >= 2,
  };
}
