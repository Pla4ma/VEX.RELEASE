import { captureException } from '../../utils/sentry';
import { upsertRewardLedger, updateRewardLedgerStatus, fetchPendingRewards } from './repository';
import { CreateRewardLedgerInputSchema } from './schemas';
import type { CreateRewardLedgerInput, RewardLedgerRecord } from './types';

export class RewardLedgerServiceError extends Error {
  constructor(operation: string, public readonly cause?: unknown) {
    super(`RewardLedgerService ${operation} failed`);
  }
}

export async function createReward(
  input: CreateRewardLedgerInput
): Promise<RewardLedgerRecord> {
  try {
    const validated = CreateRewardLedgerInputSchema.parse(input);
    const record = await upsertRewardLedger(validated);
    return record;
  } catch (error) {
    captureException(error);
    throw new RewardLedgerServiceError('createReward', error);
  }
}

export async function deliverReward(ledgerId: string): Promise<RewardLedgerRecord> {
  try {
    // In a real implementation, this would call the economy service to actually credit the reward
    const record = await updateRewardLedgerStatus(ledgerId, 'delivered');
    return record;
  } catch (error) {
    captureException(error);
    throw new RewardLedgerServiceError('deliverReward', error);
  }
}

export async function failReward(ledgerId: string, reason: string): Promise<RewardLedgerRecord> {
  try {
    const record = await updateRewardLedgerStatus(ledgerId, 'failed', reason);
    return record;
  } catch (error) {
    captureException(error);
    throw new RewardLedgerServiceError('failReward', error);
  }
}

export async function expireReward(ledgerId: string): Promise<RewardLedgerRecord> {
  try {
    const record = await updateRewardLedgerStatus(ledgerId, 'expired');
    return record;
  } catch (error) {
    captureException(error);
    throw new RewardLedgerServiceError('expireReward', error);
  }
}

export async function syncPendingRewards(userId: string): Promise<RewardLedgerRecord[]> {
  try {
    const pending = await fetchPendingRewards(userId);
    const results: RewardLedgerRecord[] = [];

    for (const reward of pending) {
      try {
        const delivered = await deliverReward(reward.id);
        results.push(delivered);
      } catch (error) {
        captureException(error);
      }
    }

    return results;
  } catch (error) {
    captureException(error);
    throw new RewardLedgerServiceError('syncPendingRewards', error);
  }
}
