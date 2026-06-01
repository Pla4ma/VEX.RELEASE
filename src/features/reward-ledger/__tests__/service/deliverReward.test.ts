import {
  repository,
  captureException,
  deliverReward,
  mockRecord,
} from './helpers';

describe('reward-ledger service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
