const mockFrom = jest.fn();

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: () => ({ from: (...args: unknown[]) => mockFrom(...args) }),
}));

import { SessionMode } from '../../../session/modes';
import {
  PersonalBestsRepositoryError,
  getPersonalBest,
  getUserPersonalBests,
  upsertPersonalBest,
} from '../repository';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const row = {
  id: '123e4567-e89b-12d3-a456-426614174111',
  user_id: userId,
  session_mode: SessionMode.SPRINT,
  duration_bucket: '15',
  best_purity_score: 82,
  best_grade: 'B',
  total_sessions: 3,
  achieved_at: '2026-05-14T12:00:00.000Z',
  updated_at: '2026-05-14T12:00:00.000Z',
};

describe('personal bests repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no personal best exists', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eqBucket = jest.fn().mockReturnValue({ maybeSingle });
    const eqMode = jest.fn().mockReturnValue({ eq: eqBucket });
    const eqUser = jest.fn().mockReturnValue({ eq: eqMode });
    mockFrom.mockReturnValue({ select: jest.fn().mockReturnValue({ eq: eqUser }) });

    await expect(getPersonalBest(userId, SessionMode.SPRINT, '15')).resolves.toBeNull();
  });

  it('inserts the first personal best record', async () => {
    const maybeSingle = jest.fn().mockResolvedValueOnce({ data: null, error: null });
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle }) }) }),
        }),
      })
      .mockReturnValueOnce({ insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single }) }) });

    const result = await upsertPersonalBest({
      userId,
      sessionMode: SessionMode.SPRINT,
      durationBucket: '15',
      bestPurityScore: 82,
      bestGrade: 'B',
    });

    expect(result.bestPurityScore).toBe(82);
  });

  it('updates only when the candidate score is better', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: row, error: null });
    const single = jest.fn().mockResolvedValue({
      data: { ...row, best_purity_score: 91, best_grade: 'A', total_sessions: 4 },
      error: null,
    });
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle }) }) }),
        }),
      })
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single }) }) }),
      });

    const result = await upsertPersonalBest({
      userId,
      sessionMode: SessionMode.SPRINT,
      durationBucket: '15',
      bestPurityScore: 91,
      bestGrade: 'A',
    });

    expect(result.bestPurityScore).toBe(91);
  });

  it('does not update when the candidate score is worse', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: row, error: null });
    const update = jest.fn();
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle }) }) }),
        }),
      })
      .mockReturnValueOnce({ update });

    const result = await upsertPersonalBest({
      userId,
      sessionMode: SessionMode.SPRINT,
      durationBucket: '15',
      bestPurityScore: 80,
      bestGrade: 'B',
    });

    expect(result.bestPurityScore).toBe(82);
    expect(update).not.toHaveBeenCalled();
  });

  it('throws on Supabase errors', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'denied' } });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle }) }) }),
      }),
    });

    await expect(getPersonalBest(userId, SessionMode.SPRINT, '15')).rejects.toThrow(
      PersonalBestsRepositoryError,
    );
  });

  it('fetches profile records', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [row], error: null }),
        }),
      }),
    });

    await expect(getUserPersonalBests(userId)).resolves.toHaveLength(1);
  });
});
