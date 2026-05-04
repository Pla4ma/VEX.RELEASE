import {
  createCompletionLedger,
  getCompletionLedgerByIdempotencyKey,
  getCompletionLedgerBySessionId,
  hasSessionBeenCompleted,
  updateRewardStatus,
} from '../repository';

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

describe('Session Completion Repository', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('createCompletionLedger', () => {
    const validLedger = {
      ledgerId: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: '550e8400-e29b-41d4-a716-446655440001',
      userId: '550e8400-e29b-41d4-a716-446655440002',
      idempotencyKey: 'idempotency-key-abc',
      completedAt: Date.now(),
      session: {
        durationSeconds: 1800,
        qualityScore: 85,
        pauseCount: 2,
      },
      effects: {
        economy: {
          xpEarned: 100,
          coinsEarned: 50,
        },
        streak: {
          action: 'EXTENDED' as const,
          previousDays: 5,
          newDays: 6,
        },
      },
      rewardStatus: 'PENDING' as const,
      nextAction: {
        type: 'NEW_SESSION' as const,
        reason: 'Session completed successfully',
      },
    };

    it('creates completion ledger successfully', async () => {
      const mockData = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        ledger_id: validLedger.ledgerId,
        session_id: validLedger.sessionId,
        user_id: validLedger.userId,
        idempotency_key: validLedger.idempotencyKey,
        completed_at: validLedger.completedAt,
        duration_seconds: validLedger.session.durationSeconds,
        quality_score: validLedger.session.qualityScore,
        pause_count: validLedger.session.pauseCount,
        effects: validLedger.effects,
        reward_status: validLedger.rewardStatus,
        next_action: validLedger.nextAction,
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

      const result = await createCompletionLedger(validLedger);

      expect(result.ledgerId).toBe(validLedger.ledgerId);
      expect(result.sessionId).toBe(validLedger.sessionId);
      expect(result.rewardStatus).toBe('PENDING');
    });

    it('returns existing ledger on duplicate idempotency key', async () => {
      const duplicateError = { code: '23505', message: 'Duplicate key' };
      const existingData = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        ledger_id: '550e8400-e29b-41d4-a716-446655440005',
        session_id: validLedger.sessionId,
        user_id: validLedger.userId,
        idempotency_key: validLedger.idempotencyKey,
        completed_at: validLedger.completedAt,
        duration_seconds: 1800,
        quality_score: 85,
        pause_count: 2,
        effects: {},
        reward_status: 'COMPLETE',
        next_action: { type: 'VIEW_PROGRESS', reason: 'Done' },
        created_at: new Date().toISOString(),
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: duplicateError })
        .mockResolvedValueOnce({ data: existingData, error: null });

      const result = await createCompletionLedger(validLedger);

      expect(result.rewardStatus).toBe('COMPLETE');
    });

    it('throws error on database failure', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(createCompletionLedger(validLedger)).rejects.toThrow('Failed to create completion ledger');
    });
  });

  describe('getCompletionLedgerByIdempotencyKey', () => {
    it('returns ledger when found', async () => {
      const mockData = {
        id: '550e8400-e29b-41d4-a716-446655440006',
        ledger_id: '550e8400-e29b-41d4-a716-446655440007',
        session_id: '550e8400-e29b-41d4-a716-446655440008',
        user_id: '550e8400-e29b-41d4-a716-446655440009',
        idempotency_key: 'key-abc',
        completed_at: Date.now(),
        duration_seconds: 1800,
        quality_score: 85,
        pause_count: 2,
        effects: {},
        reward_status: 'COMPLETE',
        next_action: { type: 'NEW_SESSION', reason: 'Done' },
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

      const result = await getCompletionLedgerByIdempotencyKey('key-abc');

      expect(result).not.toBeNull();
      expect(result?.ledgerId).toBe('ledger-123');
    });

    it('returns null when not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const result = await getCompletionLedgerByIdempotencyKey('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getCompletionLedgerBySessionId', () => {
    it('returns ledger for session', async () => {
      const mockData = {
        id: '550e8400-e29b-41d4-a716-446655440010',
        ledger_id: '550e8400-e29b-41d4-a716-446655440011',
        session_id: '550e8400-e29b-41d4-a716-446655440012',
        user_id: '550e8400-e29b-41d4-a716-446655440013',
        idempotency_key: 'key-abc',
        completed_at: Date.now(),
        duration_seconds: 1800,
        quality_score: 85,
        pause_count: 2,
        effects: {},
        reward_status: 'COMPLETE',
        next_action: { type: 'NEW_SESSION', reason: 'Done' },
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

      const result = await getCompletionLedgerBySessionId('session-456');

      expect(result?.sessionId).toBe('session-456');
    });
  });

  describe('hasSessionBeenCompleted', () => {
    it('returns true when session has completion ledger', async () => {
      const mockData = {
        id: '550e8400-e29b-41d4-a716-446655440014',
        ledger_id: '550e8400-e29b-41d4-a716-446655440015',
        session_id: '550e8400-e29b-41d4-a716-446655440016',
        user_id: '550e8400-e29b-41d4-a716-446655440017',
        idempotency_key: 'key-abc',
        completed_at: Date.now(),
        duration_seconds: 1800,
        quality_score: 85,
        pause_count: 2,
        effects: {},
        reward_status: 'COMPLETE',
        next_action: { type: 'NEW_SESSION', reason: 'Done' },
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

      const result = await hasSessionBeenCompleted('session-456');

      expect(result).toBe(true);
    });

    it('returns false when session has no completion ledger', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const result = await hasSessionBeenCompleted('session-999');

      expect(result).toBe(false);
    });
  });

  describe('updateRewardStatus', () => {
    it('updates reward status successfully', async () => {
      mockSupabase.update.mockReturnThis();

      await updateRewardStatus('ledger-123', 'COMPLETE', { deliveredAt: Date.now() });

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          reward_status: 'COMPLETE',
          metadata: { deliveredAt: expect.any(Number) },
        })
      );
    });

    it('throws error on update failure', async () => {
      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      });

      await expect(updateRewardStatus('ledger-123', 'FAILED')).rejects.toThrow(
        'Failed to update reward status'
      );
    });
  });
});
