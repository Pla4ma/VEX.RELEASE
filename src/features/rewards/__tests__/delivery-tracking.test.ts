import {
  createRewardDelivery,
  getPendingDeliveries,
  getFailedDeliveries,
  markDeliveryInProgress,
  markDeliveryDelivered,
  markDeliveryFailed,
  scheduleRetry,
  RewardDeliveryStatusSchema,
} from '../delivery-tracking';

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

import { getSupabaseClient } from '../../../config/supabase';

describe('Reward Delivery Tracking', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn(),
    or: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('RewardDeliveryStatusSchema', () => {
    it('validates all valid statuses', () => {
      const validStatuses = ['PENDING', 'IN_PROGRESS', 'DELIVERED', 'FAILED', 'RETRYING', 'PERMANENTLY_FAILED'];
      validStatuses.forEach((status) => {
        expect(RewardDeliveryStatusSchema.parse(status)).toBe(status);
      });
    });

    it('rejects invalid status', () => {
      expect(() => RewardDeliveryStatusSchema.parse('INVALID')).toThrow();
    });
  });

  describe('createRewardDelivery', () => {
    const validDelivery = {
      userId: 'user-123',
      rewardType: 'XP' as const,
      amount: 100,
      source: 'session-completion',
      sourceId: 'session-456',
      status: 'PENDING' as const,
      maxAttempts: 3,
    };

    it('creates delivery successfully', async () => {
      const mockData = {
        id: 'user-123:session-456:XP',
        user_id: validDelivery.userId,
        reward_type: validDelivery.rewardType,
        amount: validDelivery.amount,
        source: validDelivery.source,
        source_id: validDelivery.sourceId,
        status: validDelivery.status,
        attempt_count: 0,
        max_attempts: validDelivery.maxAttempts,
        last_attempt_at: null,
        delivered_at: null,
        failed_at: null,
        error_message: null,
        retry_after: null,
      };

      mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

      const result = await createRewardDelivery(validDelivery);

      expect(result.userId).toBe(validDelivery.userId);
      expect(result.rewardType).toBe(validDelivery.rewardType);
      expect(result.attemptCount).toBe(0);
    });

    it('throws error on creation failure', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(createRewardDelivery(validDelivery)).rejects.toThrow('Failed to create reward delivery');
    });
  });

  describe('getPendingDeliveries', () => {
    it('returns pending deliveries', async () => {
      const mockData = [
        {
          id: 'delivery-1',
          user_id: 'user-123',
          reward_type: 'XP',
          amount: 100,
          source: 'session',
          source_id: 'session-1',
          status: 'PENDING',
          attempt_count: 0,
          max_attempts: 3,
          last_attempt_at: null,
          delivered_at: null,
          failed_at: null,
          error_message: null,
          retry_after: null,
        },
        {
          id: 'delivery-2',
          user_id: 'user-123',
          reward_type: 'COINS',
          amount: 50,
          source: 'session',
          source_id: 'session-1',
          status: 'FAILED',
          attempt_count: 1,
          max_attempts: 3,
          last_attempt_at: Date.now(),
          delivered_at: null,
          failed_at: Date.now(),
          error_message: 'Network error',
          retry_after: null,
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

      const result = await getPendingDeliveries('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('PENDING');
      expect(result[1].status).toBe('FAILED');
    });
  });

  describe('getFailedDeliveries', () => {
    it('returns failed deliveries', async () => {
      const mockData = [
        {
          id: 'delivery-failed',
          user_id: 'user-123',
          reward_type: 'GEMS',
          amount: 5,
          source: 'boss-defeat',
          source_id: 'boss-1',
          status: 'PERMANENTLY_FAILED',
          attempt_count: 3,
          max_attempts: 3,
          last_attempt_at: Date.now(),
          delivered_at: null,
          failed_at: Date.now(),
          error_message: 'Max retries exceeded',
          retry_after: null,
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

      const result = await getFailedDeliveries('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('PERMANENTLY_FAILED');
    });
  });

  describe('markDeliveryInProgress', () => {
    it('marks delivery as in progress', async () => {
      mockSupabase.eq.mockReturnValue({ error: null });

      await markDeliveryInProgress('delivery-123');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'IN_PROGRESS',
          last_attempt_at: expect.any(Number),
        })
      );
    });
  });

  describe('markDeliveryDelivered', () => {
    it('marks delivery as delivered', async () => {
      mockSupabase.eq.mockReturnValue({ error: null });

      await markDeliveryDelivered('delivery-123');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DELIVERED',
          delivered_at: expect.any(Number),
          error_message: null,
          retry_after: null,
        })
      );
    });
  });

  describe('markDeliveryFailed', () => {
    it('marks delivery as failed with retry possible', async () => {
      mockSupabase.eq.mockReturnValue({ error: null });
      mockSupabase.rpc.mockReturnValue(1);

      await markDeliveryFailed('delivery-123', 'Network timeout', true);

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'FAILED',
          failed_at: expect.any(Number),
          error_message: 'Network timeout',
          retry_after: expect.any(Number),
        })
      );
    });

    it('marks delivery as permanently failed when cannot retry', async () => {
      mockSupabase.eq.mockReturnValue({ error: null });
      mockSupabase.rpc.mockReturnValue(3);

      await markDeliveryFailed('delivery-123', 'Max retries exceeded', false);

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PERMANENTLY_FAILED',
          failed_at: expect.any(Number),
          error_message: 'Max retries exceeded',
        })
      );
    });
  });

  describe('scheduleRetry', () => {
    it('schedules delivery for retry', async () => {
      mockSupabase.eq.mockReturnValue({ error: null });

      await scheduleRetry('delivery-123');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'RETRYING',
          retry_after: expect.any(Number),
        })
      );
    });
  });
});
