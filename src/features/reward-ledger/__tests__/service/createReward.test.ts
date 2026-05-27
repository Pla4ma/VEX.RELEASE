import { repository, captureException, createReward, mockRecord, validInput } from './helpers';

describe('reward-ledger service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReward', () => {
    it('creates a reward via repository', async () => {
      (repository.upsertRewardLedger as jest.Mock).mockResolvedValue(mockRecord);
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
      (repository.upsertRewardLedger as jest.Mock).mockResolvedValue(alreadyDelivered);
      const result = await createReward(validInput);
      expect(result.status).toBe('delivered');
      expect(repository.upsertRewardLedger).toHaveBeenCalledTimes(1);
    });

    it('captures Sentry on repository error', async () => {
      (repository.upsertRewardLedger as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(createReward(validInput)).rejects.toThrow(
        'RewardLedgerService createReward failed',
      );
      expect(captureException).toHaveBeenCalled();
    });
  });
});
