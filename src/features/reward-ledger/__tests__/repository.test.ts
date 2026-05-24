import { describe, it, expect, beforeEach } from '@jest/globals';

const mockSingle = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockFrom = jest.fn();

jest.mock('../../../config/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { upsertRewardLedger, updateRewardLedgerStatus, fetchPendingRewards, RewardLedgerRepositoryError } from '../repository';
import type { CreateRewardLedgerInput } from '../types';

const validInput: CreateRewardLedgerInput = {
  userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  idempotencyKey: 'evt_session_complete_001',
  rewardType: 'session_bonus',
  amount: 50,
  currency: 'XP',
  sourceEvent: 'session:completed',
};

const mockDbRecord = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  user_id: validInput.userId,
  idempotency_key: validInput.idempotencyKey,
  reward_type: validInput.rewardType,
  amount: 50,
  currency: 'XP',
  status: 'pending',
  source_event: validInput.sourceEvent,
  created_at: '2026-01-01T00:00:00.000Z',
  delivered_at: null,
  failed_reason: null,
  expires_at: null,
};

function buildChain(...methods: Array<{ name: string; returnValue: unknown }>) {
  const chain: Record<string, jest.Mock> = {};
  let lastMethod = '';
  methods.forEach(({ name, returnValue }) => {
    chain[name] = jest.fn().mockImplementation(() => {
      lastMethod = name;
      if (typeof returnValue === 'function') {
        return returnValue();
      }
      return returnValue;
    });
  });
  return { chain, lastMethod };
}

describe('reward-ledger repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertRewardLedger', () => {
    it('creates a new pending reward ledger entry', async () => {
      mockSingle.mockResolvedValue({ data: mockDbRecord, error: null });
      const selectMock = jest.fn().mockReturnValue({ single: mockSingle });
      const upsertMock = jest.fn().mockReturnValue({ select: selectMock });
      mockFrom.mockReturnValue({ upsert: upsertMock });

      const result = await upsertRewardLedger(validInput);
      expect(result.status).toBe('pending');
      expect(result.idempotencyKey).toBe(validInput.idempotencyKey);
      expect(result.currency).toBe('XP');
    });

    it('handles idempotency key conflict by returning existing record', async () => {
      const existingDb = { ...mockDbRecord, status: 'delivered', delivered_at: '2026-01-01T00:01:00.000Z' };
      mockSingle.mockResolvedValue({ data: existingDb, error: null });
      const selectMock = jest.fn().mockReturnValue({ single: mockSingle });
      const upsertMock = jest.fn().mockReturnValue({ select: selectMock });
      mockFrom.mockReturnValue({ upsert: upsertMock });

      const result = await upsertRewardLedger(validInput);
      expect(result.status).toBe('delivered');
    });

    it('throws RepositoryError on Supabase error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'connection refused', code: 'PGRST000' } });
      const selectMock = jest.fn().mockReturnValue({ single: mockSingle });
      const upsertMock = jest.fn().mockReturnValue({ select: selectMock });
      mockFrom.mockReturnValue({ upsert: upsertMock });

      await expect(upsertRewardLedger(validInput)).rejects.toThrow(RewardLedgerRepositoryError);
      await expect(upsertRewardLedger(validInput)).rejects.toThrow('upsert');
    });
  });

  describe('updateRewardLedgerStatus', () => {
    const ledgerId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    it('transitions to delivered', async () => {
      const deliveredDb = { ...mockDbRecord, status: 'delivered', delivered_at: '2026-01-01T00:05:00.000Z' };
      mockSingle.mockResolvedValue({ data: deliveredDb, error: null });
      const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      const result = await updateRewardLedgerStatus(ledgerId, 'delivered');
      expect(result.status).toBe('delivered');
    });

    it('transitions to failed with reason', async () => {
      const failedDb = { ...mockDbRecord, status: 'failed', failed_reason: 'insufficient_permissions' };
      mockSingle.mockResolvedValue({ data: failedDb, error: null });
      const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      const result = await updateRewardLedgerStatus(ledgerId, 'failed', 'insufficient_permissions');
      expect(result.status).toBe('failed');
      expect(result.failedReason).toBe('insufficient_permissions');
    });

    it('transitions to expired', async () => {
      const expiredDb = { ...mockDbRecord, status: 'expired' };
      mockSingle.mockResolvedValue({ data: expiredDb, error: null });
      const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      const result = await updateRewardLedgerStatus(ledgerId, 'expired');
      expect(result.status).toBe('expired');
    });

    it('throws on Supabase error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'not found', code: 'PGRST116' } });
      const eqMock = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      await expect(updateRewardLedgerStatus(ledgerId, 'delivered')).rejects.toThrow(RewardLedgerRepositoryError);
    });
  });

  describe('fetchPendingRewards', () => {
    const userId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    it('fetches pending rewards for user', async () => {
      const pendingRewards = [mockDbRecord, { ...mockDbRecord, id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' }];
      const eqStatus = jest.fn().mockReturnValue({ data: pendingRewards, error: null });
      const eqUserId = jest.fn().mockReturnValue({ eq: eqStatus });
      const selectMock = jest.fn().mockReturnValue({ eq: eqUserId });
      mockFrom.mockReturnValue({ select: selectMock });

      const result = await fetchPendingRewards(userId);
      expect(result).toHaveLength(2);
      expect(result[0]!.status).toBe('pending');
    });

    it('returns empty array when no pending rewards', async () => {
      const eqStatus = jest.fn().mockReturnValue({ data: [], error: null });
      const eqUserId = jest.fn().mockReturnValue({ eq: eqStatus });
      const selectMock = jest.fn().mockReturnValue({ eq: eqUserId });
      mockFrom.mockReturnValue({ select: selectMock });

      const result = await fetchPendingRewards(userId);
      expect(result).toHaveLength(0);
    });

    it('throws on Supabase error', async () => {
      const eqStatus = jest.fn().mockReturnValue({ data: null, error: { message: 'timeout', code: 'PGRST999' } });
      const eqUserId = jest.fn().mockReturnValue({ eq: eqStatus });
      const selectMock = jest.fn().mockReturnValue({ eq: eqUserId });
      mockFrom.mockReturnValue({ select: selectMock });

      await expect(fetchPendingRewards(userId)).rejects.toThrow(RewardLedgerRepositoryError);
    });
  });
});
