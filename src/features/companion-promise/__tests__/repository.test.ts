import {
  createPromise,
  dismissRecoveryPromise,
  fulfillPromise,
  getPendingPromise,
  getRecentPromises,
  markPromiseMissed,
  replacePromise,
} from '../repository';

jest.mock('../../../config/supabase', () => ({ getSupabaseClient: jest.fn() }));

import { getSupabaseClient } from '../../../config/supabase';

const row = {
  copy_seed: {},
  created_at: '2026-05-20T10:00:00.000Z',
  fulfilled_at: null,
  fulfilled_session_id: null,
  id: '550e8400-e29b-41d4-a716-446655440001',
  missed_at: null,
  promised_for: '2026-05-21',
  recommended_duration_minutes: 25,
  recommended_mode: 'FOCUS',
  target_date: '2026-05-21',
  target_duration_minutes: 25,
  target_mode: 'FOCUS',
  source_session_id: '550e8400-e29b-41d4-a716-446655440002',
  status: 'active',
  updated_at: '2026-05-20T10:00:00.000Z',
  user_id: 'user-123',
  window_end: '2026-05-21T23:59:59.999Z',
  window_start: '2026-05-21T00:00:00.000Z',
};

describe('companion promise repository', () => {
  const mockSupabase = {
    eq: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('creates a promise row', async () => {
    mockSupabase.single.mockResolvedValue({ data: row, error: null });
    const result = await createPromise({
      createdAt: row.created_at,
      sourceSessionId: row.source_session_id,
      targetDate: row.promised_for,
      targetDurationMinutes: row.recommended_duration_minutes,
      targetMode: 'FOCUS',
      userId: row.user_id,
    });
    expect(result.status).toBe('pending');
    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
    );
  });

  it('reads recent and pending promises', async () => {
    mockSupabase.limit.mockResolvedValueOnce({ data: [row], error: null });
    await expect(getRecentPromises(row.user_id, 3)).resolves.toHaveLength(1);
    mockSupabase.limit.mockResolvedValueOnce({ data: [row], error: null });
    await expect(getPendingPromise(row.user_id)).resolves.toMatchObject({
      id: row.id,
      status: 'pending',
    });
  });

  it('fulfills, misses, replaces, and dismisses a promise', async () => {
    mockSupabase.single
      .mockResolvedValueOnce({
        data: { ...row, status: 'fulfilled', fulfilled_at: row.created_at },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { ...row, status: 'missed', missed_at: row.created_at },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { ...row, status: 'skipped' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { ...row, status: 'skipped' },
        error: null,
      });

    await expect(
      fulfillPromise(row.id, row.created_at, row.source_session_id),
    ).resolves.toMatchObject({ status: 'fulfilled' });
    await expect(
      markPromiseMissed(row.id, row.created_at),
    ).resolves.toMatchObject({ status: 'missed' });
    await expect(replacePromise(row.id)).resolves.toMatchObject({
      status: 'replaced',
    });
    await expect(dismissRecoveryPromise(row.id)).resolves.toMatchObject({
      status: 'replaced',
    });
  });
});
