import { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { useQueryClient } from '@tanstack/react-query';
import { economyKeys } from '../../../features/economy/hooks';
import { creditSessionRewards } from '../../../features/economy/service';
import {
  progressionKeys,
  useProgressionSummary,
} from '../../../features/progression/hooks';
import { getLevelUpCelebrationRewards } from '../../../features/progression/service';
import type { ChestResult } from '../../../features/rewards/chest-engine';
import type { SessionSummary } from '../../../session/types';
import { triggerHaptic } from '../../../utils/haptics';

type RewardCreditStatus =
  | 'idle'
  | 'crediting'
  | 'success'
  | 'retrying'
  | 'failed';
type CelebrationState = {
  newLevel: number;
  oldLevel: number;
  rewards: string[];
} | null;
type ProgressionSummaryData = NonNullable<
  ReturnType<typeof useProgressionSummary>['data']
>;
const RETRY_DELAYS_MS = [500, 1000, 2000] as const;

export function useSessionRewardSync({
  applySessionMastery,
  chestResult,
  focusedDuration,
  focusPurityScore,
  optimisticXpReward,
  primarySquadId,
  progressionSummary,
  refetchProgressionSummary,
  showToast,
  streakMultiplier,
  summary,
  userId,
}: {
  applySessionMastery: (input: {
    focusPurityScore: number;
    focusedDuration: number;
    interruptions: number;
    isMounted: boolean;
    streakDays: number;
  }) => unknown;
  chestResult: ChestResult | null;
  focusedDuration: number;
  focusPurityScore: number;
  optimisticXpReward: number;
  primarySquadId: string | null;
  progressionSummary: ProgressionSummaryData | undefined;
  refetchProgressionSummary: () => Promise<ProgressionSummaryData | undefined>;
  showToast: (input: {
    duration: number;
    message: string;
    title: string;
    type: 'error' | 'success';
  }) => void;
  streakMultiplier: number;
  summary: SessionSummary;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const retryTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const hasCreditedRewardsRef = useRef(false);
  const rewardCreditInFlightRef = useRef(false);
  const optimisticXpAppliedRef = useRef(false);
  const isMountedRef = useRef(true);
  const [rewardCreditStatus, setRewardCreditStatus] =
    useState<RewardCreditStatus>('idle');
  const [rewardCreditError, setRewardCreditError] = useState<string | null>(
    null,
  );
  const [levelUpCelebration, setLevelUpCelebration] =
    useState<CelebrationState>(null);

  const applyChestRewards = useCallback(async () => {
    if (
      !userId ||
      !chestResult ||
      hasCreditedRewardsRef.current ||
      rewardCreditInFlightRef.current
    ) {
      return;
    }

    rewardCreditInFlightRef.current = true;
    hasCreditedRewardsRef.current = true;
    setRewardCreditStatus('crediting');
    setRewardCreditError(null);

    if (!optimisticXpAppliedRef.current) {
      queryClient.setQueryData<ProgressionSummaryData | undefined>(
        progressionKeys.summary(userId),
        (previous) =>
          previous
            ? { ...previous, xp: previous.xp + optimisticXpReward }
            : previous,
      );
      optimisticXpAppliedRef.current = true;
    }

    try {
      const beforeSummary =
        progressionSummary ?? (await refetchProgressionSummary());
      const oldLevel = beforeSummary?.level ?? summary.userLevel ?? 1;

      for (
        let attemptIndex = 0;
        attemptIndex <= RETRY_DELAYS_MS.length;
        attemptIndex += 1
      ) {
        try {
          if (attemptIndex > 0 && isMountedRef.current)
            {setRewardCreditStatus('retrying');}
          await creditSessionRewards(userId, chestResult);
          applySessionMastery({
            focusPurityScore,
            focusedDuration,
            interruptions: summary.interruptions ?? 0,
            isMounted: isMountedRef.current,
            streakDays: summary.streakDays ?? 0,
          });

          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ['progression', userId],
            }),
            queryClient.invalidateQueries({ queryKey: ['economy', userId] }),
            queryClient.invalidateQueries({
              queryKey: progressionKeys.byUser(userId),
            }),
            queryClient.invalidateQueries({
              queryKey: progressionKeys.summary(userId),
            }),
            queryClient.invalidateQueries({ queryKey: economyKeys.all }),
            queryClient.invalidateQueries({
              queryKey: economyKeys.wallet(userId),
            }),
          ]);
          const afterSummary = await refetchProgressionSummary();
          optimisticXpAppliedRef.current = false;
          if (isMountedRef.current) {
            setRewardCreditStatus('success');
            if ((afterSummary?.level ?? oldLevel) > oldLevel) {
              setLevelUpCelebration({
                newLevel: afterSummary?.level ?? oldLevel,
                oldLevel,
                rewards: getLevelUpCelebrationRewards(
                  oldLevel,
                  afterSummary?.level ?? oldLevel,
                ),
              });
              void triggerHaptic('impactHeavy');
            } else {
              void triggerHaptic('success');
            }

            showToast({
              duration: 3000,
              message:
                chestResult.gemReward > 0
                  ? `+${chestResult.coinReward} coins +${chestResult.gemReward} gems`
                  : `+${chestResult.coinReward} coins`,
              title: `+${chestResult.xpReward} XP`,
              type: 'success',
            });
          }

          return;
        } catch (error) {
          if (attemptIndex === RETRY_DELAYS_MS.length) {
            throw error;
          }

          await new Promise<void>((resolve) => {
            const timeoutId = setTimeout(
              resolve,
              RETRY_DELAYS_MS[attemptIndex],
            );
            retryTimeoutsRef.current.push(timeoutId);
          });
        }
      }
    } catch (error) {
      hasCreditedRewardsRef.current = false;
      optimisticXpAppliedRef.current = false;
      await queryClient.invalidateQueries({
        queryKey: progressionKeys.summary(userId),
      });

      if (isMountedRef.current) {
        setRewardCreditStatus('failed');
        setRewardCreditError("Rewards couldn't be saved yet.");
      }
      void triggerHaptic('warning');
      Sentry.captureException(error, {
        tags: { feature: 'session-complete-credit' },
      });
      showToast({
        duration: 5000,
        message: 'Could not sync rewards. We will retry automatically.',
        title: 'Rewards pending',
        type: 'error',
      });
    } finally {
      rewardCreditInFlightRef.current = false;
    }
  }, [
    applySessionMastery,
    chestResult,
    focusPurityScore,
    focusedDuration,
    optimisticXpReward,
    primarySquadId,
    progressionSummary,
    queryClient,
    refetchProgressionSummary,
    showToast,
    streakMultiplier,
    summary,
    userId,
  ]);
  useEffect(
    () => () => {
      isMountedRef.current = false;
      retryTimeoutsRef.current.forEach(clearTimeout);
    },
    [],
  );

  useEffect(() => {
    if (rewardCreditStatus !== 'failed') {return;}
    const timeoutId = setTimeout(() => {
      void applyChestRewards();
    }, 30000);
    retryTimeoutsRef.current.push(timeoutId);
    return () => clearTimeout(timeoutId);
  }, [applyChestRewards, rewardCreditStatus]);
  return {
    actions: { applyChestRewards, setLevelUpCelebration },
    levelUpCelebration,
    rewardCreditError,
    rewardCreditStatus,
  };
}
