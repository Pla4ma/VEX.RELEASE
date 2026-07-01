import {
  persistCompletionLedger,
  getCompletionLedgerByIdempotencyKey,
  getCompletionLedgerBySessionId,
  hasSessionBeenCompleted,
  updateCompletionSyncStatus,
} from '../repository';
import {
  createCompletionLedger,
  createLedgerRow,
  SESSION_ID,
} from './ledger-test-utils';

jest.mock('../../../config/supabase', () => ({ getSupabaseClient: jest.fn() }));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

import { getSupabaseClient } from '../../../config/supabase';

describe('Session completion repository', () => {
  const mockSupabase = {
    eq: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('creates completion ledger successfully', async () => {
    const ledger = createCompletionLedger();
    mockSupabase.single.mockResolvedValue({
      data: createLedgerRow(ledger),
      error: null,
    });

    const result = await persistCompletionLedger(ledger);

    expect(result).toMatchObject({
      ledgerId: ledger.ledgerId,
      idempotencyKey: ledger.idempotencyKey,
      sessionId: ledger.sessionId,
      offlineSyncStatus: 'synced',
    });
  });

  it('returns existing ledger on duplicate idempotency key conflict', async () => {
    const ledger = createCompletionLedger();
    const existing = createCompletionLedger({
      ledgerId: '550e8400-e29b-41d4-a716-446655440099',
      offlineSyncStatus: 'pending_sync',
    });
    mockSupabase.single
      .mockResolvedValueOnce({
        data: null,
        error: { code: '23505', message: 'Duplicate' },
      })
      .mockResolvedValueOnce({ data: createLedgerRow(existing), error: null });

    const result = await persistCompletionLedger(ledger);

    expect(result.ledgerId).toBe(existing.ledgerId);
    expect(result.offlineSyncStatus).toBe('pending_sync');
  });

  it('throws repository error on invalid create response and Supabase error', async () => {
    const ledger = createCompletionLedger();
    mockSupabase.single.mockResolvedValueOnce({
      data: { bad: true },
      error: null,
    });
    await expect(persistCompletionLedger(ledger)).rejects.toThrow(
      'Session completion repository failed during create:invalid-response',
    );

    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { code: '500', message: 'Database error' },
    });
    await expect(persistCompletionLedger(ledger)).rejects.toThrow(
      'Session completion repository failed during create',
    );
  });

  it('fetches by idempotency key and session id, including not found', async () => {
    const ledger = createCompletionLedger();
    mockSupabase.single
      .mockResolvedValueOnce({ data: createLedgerRow(ledger), error: null })
      .mockResolvedValueOnce({ data: createLedgerRow(ledger), error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

    await expect(
      getCompletionLedgerByIdempotencyKey(ledger.idempotencyKey),
    ).resolves.toMatchObject({ ledgerId: ledger.ledgerId });
    await expect(
      getCompletionLedgerBySessionId(SESSION_ID),
    ).resolves.toMatchObject({ sessionId: SESSION_ID });
    await expect(
      getCompletionLedgerBySessionId('550e8400-e29b-41d4-a716-446655440888'),
    ).resolves.toBeNull();
  });

  it('reports session completion and updates sync status', async () => {
    const ledger = createCompletionLedger();
    mockSupabase.single.mockResolvedValue({
      data: createLedgerRow(ledger),
      error: null,
    });
    await expect(hasSessionBeenCompleted(SESSION_ID)).resolves.toBe(true);

    mockSupabase.eq.mockResolvedValueOnce({ error: null });
    await updateCompletionSyncStatus(ledger.ledgerId, 'failed_sync');
    expect(mockSupabase.update).toHaveBeenCalledWith({
      offline_sync_status: 'failed_sync',
    });
  });

  it('throws repository error when sync status update fails', async () => {
    mockSupabase.eq.mockResolvedValueOnce({
      error: { message: 'Update failed' },
    });

    await expect(
      updateCompletionSyncStatus(
        '550e8400-e29b-41d4-a716-446655440001',
        'failed_sync',
      ),
    ).rejects.toThrow(
      'Session completion repository failed during update-sync-status',
    );
  });
});
