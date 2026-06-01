import { useCallback, useEffect, useMemo, useState } from 'react';
import { MasteryService } from '../../features/mastery/service';
import {
  getMasteryRankDisplay,
  MASTERY_RANK_THRESHOLDS,
  type MasteryRank,
  type MasteryState,
} from '../../features/mastery/types';

function calculatePointsToNextRank(
  currentPoints: number,
  currentRank: MasteryRank,
): number {
  const ranks: MasteryRank[] = [
    'APPRENTICE',
    'ADEPT',
    'EXPERT',
    'MASTER',
    'GRANDMASTER',
  ];
  const currentIndex = ranks.indexOf(currentRank);
  if (currentIndex >= ranks.length - 1) {
    return 0;
  }
  const nextRank = ranks[currentIndex + 1]!;
  return Math.max(0, MASTERY_RANK_THRESHOLDS[nextRank] - currentPoints);
}

export function useMasteryState(userId: string | null) {
  const [state, setState] = useState<MasteryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadMastery = useCallback(async () => {
    if (!userId) {
      setState(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const masteryState = MasteryService.getOrCreateMasteryState(userId);
      setState(masteryState);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load mastery state'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    void loadMastery();
  }, [loadMastery]);
  const claimChallenge = useCallback(
    (challengeId: string) => {
      if (!userId) {
        return false;
      }
      const success = MasteryService.claimChallenge(userId, challengeId);
      if (success) {
        const updatedState = MasteryService.getOrCreateMasteryState(userId);
        setState(updatedState);
      }
      return success;
    },
    [userId],
  );
  const refreshChallenges = useCallback(() => {
    if (!userId) {
      return;
    }
    const updatedState = MasteryService.refreshChallenges(userId);
    setState(updatedState);
  }, [userId]);
  const pointsToNext = state
    ? calculatePointsToNextRank(
        state.totalMasteryPoints,
        state.rank ?? 'APPRENTICE',
      )
    : 0;
  const nextRankName = useMemo(() => {
    if (!state) {
      return '';
    }
    const ranks: MasteryRank[] = [
      'APPRENTICE',
      'ADEPT',
      'EXPERT',
      'MASTER',
      'GRANDMASTER',
    ];
    const currentIndex = ranks.indexOf(state.rank ?? 'APPRENTICE');
    if (currentIndex >= ranks.length - 1) {
      return 'Max Rank';
    }
    return getMasteryRankDisplay(ranks[currentIndex + 1]!).title;
  }, [state]);
  const rankProgress = useMemo(() => {
    if (!state || pointsToNext === 0) {
      return 1;
    }
    const currentThreshold = MASTERY_RANK_THRESHOLDS[state.rank!];
    const nextThreshold = currentThreshold + pointsToNext;
    const progressInRank = state.totalMasteryPoints - currentThreshold;
    const rankRange = nextThreshold - currentThreshold;
    return Math.max(0, Math.min(1, progressInRank / rankRange));
  }, [state, pointsToNext]);
  return {
    state,
    isLoading,
    error,
    refetch: loadMastery,
    claimChallenge,
    refreshChallenges,
    pointsToNext,
    nextRankName,
    rankProgress,
  };
}
