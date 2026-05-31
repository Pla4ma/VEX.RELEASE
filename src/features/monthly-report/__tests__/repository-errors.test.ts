const mockSelect = jest.fn();

jest.mock('../../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
    })),
  },
}));

import {
  fetchMonthlyFocusReportInput,
  MonthlyReportRepositoryError,
} from '../repository';

describe('fetchMonthlyFocusReportInput — error and empty handling', () => {
  beforeEach(() => {
    mockSelect.mockReset();
  });

  it('throws MonthlyReportRepositoryError on Supabase error', async () => {
    // Query 1: focus_score_history — .select().eq().gte().lte().order()
    mockSelect
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'DB error', code: 'XX000' },
              }),
            }),
          }),
        }),
      })
      // Query 2: session_ledgers (should not be reached)
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      })
      // Query 3: focus_score_current (should not be reached)
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: { factors: {} }, error: null }),
        }),
      });

    await expect(
      fetchMonthlyFocusReportInput({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        month: 3,
        year: 2025,
      }),
    ).rejects.toThrow(MonthlyReportRepositoryError);
  });

  it('handles empty sessions gracefully', async () => {
    const scoreData = [{ score: 550, created_at: '2025-03-01T00:00:00Z' }];
    const factors = {};

    // Query 1: focus_score_history — .select().eq().gte().lte().order()
    mockSelect
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest
                .fn()
                .mockResolvedValue({ data: scoreData, error: null }),
            }),
          }),
        }),
      })
      // Query 2: session_ledgers — .select().eq().gte().lte()
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      })
      // Query 3: focus_score_current — .select().eq().single()
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: { factors }, error: null }),
        }),
      });

    const result = await fetchMonthlyFocusReportInput({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      month: 3,
      year: 2025,
    });

    expect(result.sessionCount).toBe(0);
    expect(result.bestFocusWindow).toBe('No data');
    expect(result.strongestPattern).toBe('No data');
  });
});
