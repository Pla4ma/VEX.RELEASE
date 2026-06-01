jest.mock('../repository', () => ({
  upsertRewardLedger: jest.fn(),
  getRewardLedgerById: jest.fn(),
  updateRewardLedgerStatus: jest.fn(),
  fetchPendingRewards: jest.fn(),
}));
jest.mock('../../../config/sentry', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

import { createReward, deliverReward } from '../service';
import * as repository from '../repository';
import { captureException } from '../../../config/sentry';
import type { CreateRewardLedgerInput, RewardLedgerRecord } from '../types';

const mockRecord: RewardLedgerRecord = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  idempotencyKey: 'evt_session_complete_001',
  rewardType: 'session_bonus',
  amount: 50,
  currency: 'XP',
  status: 'pending',
  sourceEvent: 'session:completed',
  createdAt: '2026-01-01T00:00:00.000Z',
  deliveredAt: null,
  failedReason: null,
  expiresAt: null,
};

const validInput: CreateRewardLedgerInput = {
  userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  idempotencyKey: 'evt_session_complete_001',
  rewardType: 'session_bonus',
  amount: 50,
  currency: 'XP',
  sourceEvent: 'session:completed',
};

describe('reward-ledger service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReward', () => {
    it('creates a reward via repository', async () => {
      (repository.upsertRewardLedger as jest.Mock).mockResolvedValue(
        mockRecord,
      );
      const result = await createReward(validInput);
      expect(result.status).toBe('pending');
      expect(result.idempotencyKey).toBe(validInput.idempotencyKey);
      expect(repository.upsertRewardLedger).toHaveBeenCalledTimes(1);
    });

    it('preserves idempotency - duplicate event does not create duplicate reward', async () => {
      const alreadyDelivered = {
        ...mockRecord,
        status: 'delivered' as const,
        deliveredAt: '2026-01-01T00:01:00.000Z',
      };
      (repository.upsertRewardLedger as jest.Mock).mockResolvedValue(
        alreadyDelivered,
      );
      const result = await createReward(validInput);
      expect(result.status).toBe('delivered');
      expect(repository.upsertRewardLedger).toHaveBeenCalledTimes(1);
    });

    it('captures Sentry on repository error', async () => {
      (repository.upsertRewardLedger as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(createReward(validInput)).rejects.toThrow(
        'RewardLedgerService createReward failed',
      );
      expect(captureException).toHaveBeenCalled();
    });
  });

  describe('deliverReward', () => {
    const ledgerId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    it('fetches ledger and updates status to delivered (currency disabled)', async () => {
      (repository.getRewardLedgerById as jest.Mock).mockResolvedValue(
        mockRecord,
      );
      const delivered = {
        ...mockRecord,
        status: 'delivered' as const,
        deliveredAt: '2026-01-01T00:05:00.000Z',
      };
      (repository.updateRewardLedgerStatus as jest.Mock).mockResolvedValue(
        delivered,
      );
      const result = await deliverReward(ledgerId);
      expect(result.status).toBe('delivered');
      expect(repository.updateRewardLedgerStatus).toHaveBeenCalledWith(
        ledgerId,
        'delivered',
      );
    });

    it('skips if already not pending', async () => {
      const alreadyDelivered = { ...mockRecord, status: 'delivered' as const };
      (repository.getRewardLedgerById as jest.Mock).mockResolvedValue(
        alreadyDelivered,
      );
      const result = await deliverReward(ledgerId);
      expect(result.status).toBe('delivered');
    });

    it('captures Sentry on error', async () => {
      (repository.getRewardLedgerById as jest.Mock).mockRejectedValue(
        new Error('network timeout'),
      );
      await expect(deliverReward(ledgerId)).rejects.toThrow(
        'RewardLedgerService deliverReward failed',
      );
      expect(captureException).toHaveBeenCalled();
    });
  });
});
