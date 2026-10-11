import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/react-native';

import { repairPendingCompletion } from './completion-repair-service';

type RewardCreditStatus = 'idle' | 'success' | 'failed' | 'retrying' | 'crediting';

export function useCompletionRewardRepair(userId: string | null, sessionId: string): {
  applyCompletionRewards: () => Promise<void>;
  rewardCreditError: string | null;
  rewardCreditStatus: RewardCreditStatus;
} {
  const [rewardCreditStatus, setRewardCreditStatus] = useState<RewardCreditStatus>('idle');
  const [rewardCreditError, setRewardCreditError] = useState<string | null>(null);
  const applyCompletionRewards = useCallback(async (): Promise<void> => {
    if (!userId) {
      const error = new Error('Cannot repair completion without an authenticated user');
      setRewardCreditStatus('failed');
      setRewardCreditError(error.message);
      throw error;
    }
    setRewardCreditStatus('crediting');
    setRewardCreditError(null);
    try {
      await repairPendingCompletion({ userId, sessionId });
      setRewardCreditStatus('success');
    } catch (error: unknown) {
      const normalized = error instanceof Error ? error : new Error('Completion repair failed');
      setRewardCreditStatus('failed');
      setRewardCreditError(normalized.message);
      Sentry.captureException(error, { tags: { feature: 'completion-repair' } });
      throw normalized;
    }
  }, [userId, sessionId]);
  return { applyCompletionRewards, rewardCreditError, rewardCreditStatus };
}
