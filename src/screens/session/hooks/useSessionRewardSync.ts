import { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  progressionKeys,
  useProgressionSummary,
} from '../../../features/progression/hooks';
import type { SessionSummary } from '../../../session/types';
import type { HeadlineReward } from '../../../features/session-completion/headline-reward.schemas';
import { triggerHaptic } from '../../../utils/haptics';

const RETRY_DELAYS_MS = [500, 1000, 2000] as const;
const MAX_RETRY_ATTEMPTS = 3;

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

interface SessionRewardSyncInput {
  applySessionMastery: (input: {
    focusPurityScore: number;
    focusedDuration: number;
    interruptions: number;
    isMounted: boolean;
    streakDays: number;
  }) => unknown;
  applyChestRewards: (input: { sessionId: string; rewards: HeadlineReward[] }) => Promise<void>;
  creditSessionRewards: (userId: string, rewards: HeadlineReward[]) => Promise<HeadlineReward[]>;
  focusedDuration: number;
  focusPurityScore: number;
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
}

export function useSessionRewardSync(input: SessionRewardSyncInput) {
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  const attemptRef = useRef(0);
  const [rewardCreditStatus, setRewardCreditStatus] =
    useState<RewardCreditStatus>('idle');
  const [rewardCreditError, setRewardCreditError] = useState<string | null>(
    null,
  );
  const [levelUpCelebration, setLevelUpCelebration] =
    useState<CelebrationState>(null);

  const applyCompletionRewards = useCallback(async (): Promise<void> => {
    if (!input.userId || !input.summary) {
      return;
    }

    // Call applyChestRewards which internally calls creditSessionRewards
    await input.applyChestRewards({ sessionId: input.summary.sessionId, rewards: [] });

    attemptRef.current = 0;
    await attemptRewardSync();

    async function attemptRewardSync(): Promise<void> {
      setRewardCreditStatus(attemptRef.current === 0 ? 'crediting' : 'retrying');
      setRewardCreditError(null);

      try {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['progression', input.userId],
          }),
          queryClient.invalidateQueries({
            queryKey: progressionKeys.byUser(input.userId),
          }),
          queryClient.invalidateQueries({
            queryKey: progressionKeys.summary(input.userId),
          }),
        ]);

        await input.refetchProgressionSummary();

        if (isMountedRef.current) {
          setRewardCreditStatus('success');
          triggerHaptic('success');
          input.showToast({
            duration: 2500,
            message: 'Rewards are owned by the saved completion ledger.',
            title: 'Session rewards synced',
            type: 'success',
          });
        }
      } catch (error) {
        attemptRef.current += 1;

        // Retry loop with attemptIndex <= RETRY_DELAYS_MS.length
        const attemptIndex = attemptRef.current;
        if (attemptIndex <= RETRY_DELAYS_MS.length && isMountedRef.current) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAYS_MS[attemptIndex - 1]),
          );
          return attemptRewardSync();
        }

        // All retries exhausted
        if (isMountedRef.current) {
          setRewardCreditStatus('failed');
          setRewardCreditError('Reward display could not refresh after 3 attempts.');
        }
        triggerHaptic('warning');
        Sentry.captureException(error, {
          tags: { feature: 'session-complete-display' },
        });
        if (isMountedRef.current) {
          input.showToast({
            duration: 5000,
            message: 'Your session is saved. Pull to refresh rewards in a moment.',
            title: 'Reward display delayed',
            type: 'error',
          });
        }
      }
    }
  }, [input, queryClient]);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  return {
    actions: { applyCompletionRewards, setLevelUpCelebration },
    levelUpCelebration,
    rewardCreditError,
    rewardCreditStatus,
  };
}
