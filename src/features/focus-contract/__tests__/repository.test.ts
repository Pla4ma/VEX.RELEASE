const mockFrom = jest.fn();

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

import {
  FocusContractRepositoryError,
  createContract,
  getContractForSession,
  getRecentContracts,
  reflectOnContract,
} from '../repository';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const sessionId = '123e4567-e89b-12d3-a456-426614174111';
const contractId = '123e4567-e89b-12d3-a456-426614174222';

const dbRow = {
  id: contractId,
  session_id: sessionId,
  user_id: userId,
  task_description: 'Draft the report intro',
  completion_status: null,
  reflection_at: null,
  created_at: '2026-05-14T12:00:00.000Z',
};

describe('focus-contract repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a contract from a Supabase insert response', async () => {
    const single = jest.fn().mockResolvedValue({ data: dbRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ insert });

    const result = await createContract({
      sessionId,
      userId,
      taskDescription: 'Draft the report intro',
    });

    expect(result.id).toBe(contractId);
    expect(insert).toHaveBeenCalledWith({
      session_id: sessionId,
      user_id: userId,
      task_description: 'Draft the report intro',
    });
  });

  it('throws RepositoryError on Supabase create error', async () => {
    const single = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'denied' } });
    mockFrom.mockReturnValue({
      insert: jest
        .fn()
        .mockReturnValue({ select: jest.fn().mockReturnValue({ single }) }),
    });

    await expect(
      createContract({ sessionId, userId, taskDescription: 'Draft' }),
    ).rejects.toThrow(FocusContractRepositoryError);
  });

  it('finds a contract for a session', async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: dbRow, error: null });
    const eqUser = jest.fn().mockReturnValue({ maybeSingle });
    const eqSession = jest.fn().mockReturnValue({ eq: eqUser });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: eqSession }),
    });

    const result = await getContractForSession(sessionId, userId);

    expect(result?.sessionId).toBe(sessionId);
  });

  it('returns null when a session has no contract', async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const eqUser = jest.fn().mockReturnValue({ maybeSingle });
    const eqSession = jest.fn().mockReturnValue({ eq: eqUser });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: eqSession }),
    });

    await expect(getContractForSession(sessionId, userId)).resolves.toBeNull();
  });

  it('throws when Supabase returns an invalid shape', async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({
        data: { ...dbRow, task_description: '' },
        error: null,
      });
    const eqUser = jest.fn().mockReturnValue({ maybeSingle });
    const eqSession = jest.fn().mockReturnValue({ eq: eqUser });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: eqSession }),
    });

    await expect(getContractForSession(sessionId, userId)).rejects.toThrow();
  });

  it('updates reflection and fetches recent contracts', async () => {
    mockFrom
      .mockReturnValueOnce({
        update: jest
          .fn()
          .mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest
              .fn()
              .mockReturnValue({
                limit: jest
                  .fn()
                  .mockResolvedValue({ data: [dbRow], error: null }),
              }),
          }),
        }),
      });

    await expect(
      reflectOnContract(contractId, 'done'),
    ).resolves.toBeUndefined();
    await expect(getRecentContracts(userId, 5)).resolves.toHaveLength(1);
  });
});
