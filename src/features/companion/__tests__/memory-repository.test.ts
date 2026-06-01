const mockFrom = jest.fn();

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: () => ({ from: mockFrom }),
}));

import {
  CompanionMemoryRepositoryError,
  createMemory,
  getMemories,
  hasMemory,
} from '../memory-repository';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const row = {
  body: 'Zero pauses. Clean finish. You showed yourself what full focus feels like.',
  created_at: '2026-05-14T12:00:00.000Z',
  grade: 'S',
  id: '123e4567-e89b-12d3-a456-426614174111',
  purity_score: 100,
  session_date: '2026-05-14',
  session_id: '123e4567-e89b-12d3-a456-426614174222',
  streak_day: 7,
  title: 'First Perfect Session',
  type: 'first_s_grade',
  user_id: userId,
};

const input = {
  body: row.body,
  grade: 'S' as const,
  purityScore: 100,
  sessionDate: row.session_date,
  sessionId: row.session_id,
  streakDay: 7,
  title: row.title,
  type: 'first_s_grade' as const,
  userId,
};

describe('companion memory repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates the first memory for a user and type', async () => {
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ insert });

    const result = await createMemory(input);

    expect(result.type).toBe('first_s_grade');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'first_s_grade', user_id: userId }),
    );
  });

  it('ignores duplicate memory conflicts without throwing', async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      },
    });
    const select = jest.fn().mockReturnValue({ single });
    mockFrom.mockReturnValue({ insert: jest.fn().mockReturnValue({ select }) });

    await expect(createMemory(input)).resolves.toBeNull();
  });

  it('fetches newest memories first with a limit', async () => {
    const limit = jest.fn().mockResolvedValue({ data: [row], error: null });
    const order = jest.fn().mockReturnValue({ limit });
    const eq = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await getMemories(userId);

    expect(result).toHaveLength(1);
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(limit).toHaveBeenCalledWith(50);
  });

  it('checks whether a memory type already exists', async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: { id: row.id }, error: null });
    const eqType = jest.fn().mockReturnValue({ maybeSingle });
    const eqUser = jest.fn().mockReturnValue({ eq: eqType });
    const select = jest.fn().mockReturnValue({ eq: eqUser });
    mockFrom.mockReturnValue({ select });

    await expect(hasMemory(userId, 'first_s_grade')).resolves.toBe(true);
  });

  it('throws a repository error on Supabase failures', async () => {
    const limit = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'db down' } });
    const order = jest.fn().mockReturnValue({ limit });
    const eq = jest.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select: jest.fn().mockReturnValue({ eq }) });

    await expect(getMemories(userId)).rejects.toThrow(
      CompanionMemoryRepositoryError,
    );
  });
});
