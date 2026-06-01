import { captureException, addBreadcrumb } from '../../config/sentry';
import {
  upsertRewardLedger,
  getRewardLedgerById,
  updateRewardLedgerStatus,
  fetchPendingRewards,
} from './repository';
import { CreateRewardLedgerInputSchema } from './schemas';
import type { CreateRewardLedgerInput, RewardLedgerRecord } from './types';

export class RewardLedgerServiceError extends Error {
  constructor(
    operation: string,
    public readonly cause?: unknown,
  ) {
    super(`RewardLedgerService ${operation} failed`);
  }
}


export async function createReward(
  input: CreateRewardLedgerInput,
): Promise<RewardLedgerRecord> {
  try {
    const validated = CreateRewardLedgerInputSchema.parse(input);
    const record = await upsertRewardLedger(validated);
    addBreadcrumb('reward_created', 'reward-ledger', {
      ledgerId: record.id,
      currency: record.currency,
      amount: record.amount,
    });
    return record;
  } catch (error) {
    captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        tags: { feature: 'reward-ledger', operation: 'createReward' },
      },
    );
    throw new RewardLedgerServiceError('createReward', error);
  }
}

export async function deliverReward(
  ledgerId: string,
): Promise<RewardLedgerRecord> {
  try {
    const ledgerRecord = await getRewardLedgerById(ledgerId);

    if (ledgerRecord.status !== 'pending') {
      return ledgerRecord;
    }

    // Currency system is disabled (ARCH-04). Reward is recorded but no currency granted.
    const record = await updateRewardLedgerStatus(ledgerId, 'delivered');
    addBreadcrumb('reward_delivered', 'reward-ledger', {
      ledgerId,
      currency: ledgerRecord.currency,
      amount: ledgerRecord.amount,
    });
    return record;
  } catch (error) {
    captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        tags: { feature: 'reward-ledger', operation: 'deliverReward' },
      },
    );
    throw new RewardLedgerServiceError('deliverReward', error);
  }
}

export async function failReward(
  ledgerId: string,
  reason: string,
): Promise<RewardLedgerRecord> {
  try {
    const record = await updateRewardLedgerStatus(ledgerId, 'failed', reason);
    addBreadcrumb('reward_failed', 'reward-ledger', {
      ledgerId,
      reason,
    });
    return record;
  } catch (error) {
    captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        tags: { feature: 'reward-ledger', operation: 'failReward' },
      },
    );
    throw new RewardLedgerServiceError('failReward', error);
  }
}

export async function expireReward(
  ledgerId: string,
): Promise<RewardLedgerRecord> {
  try {
    const record = await updateRewardLedgerStatus(ledgerId, 'expired');
    addBreadcrumb('reward_expired', 'reward-ledger', { ledgerId });
    return record;
  } catch (error) {
    captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        tags: { feature: 'reward-ledger', operation: 'expireReward' },
      },
    );
    throw new RewardLedgerServiceError('expireReward', error);
  }
}

export async function syncPendingRewards(
  userId: string,
): Promise<RewardLedgerRecord[]> {
  try {
    const pending = await fetchPendingRewards(userId);
    const results: RewardLedgerRecord[] = [];

    for (const reward of pending) {
      try {
        const delivered = await deliverReward(reward.id);
        results.push(delivered);
      } catch (error) {
        captureException(
          error instanceof Error ? error : new Error(String(error)),
          {
            tags: { feature: 'reward-ledger', operation: 'syncPendingRewards' },
          },
        );
      }
    }

    return results;
  } catch (error) {
    captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        tags: { feature: 'reward-ledger', operation: 'syncPendingRewards' },
      },
    );
    throw new RewardLedgerServiceError('syncPendingRewards', error);
  }
}
