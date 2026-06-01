import {
  fetchMonthlyFocusReportInput,
  MonthlyReportRepositoryError,
} from '../repository';
import { mockSelect, setupChain } from './test-setup';

describe('fetchMonthlyFocusReportInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computes bestFocusWindow from session hours', async () => {
    const sessions = [
      {
        grade: 'A',
        duration_seconds: 2400,
        started_at: '2025-03-10T09:00:00Z',
      },
      {
        grade: 'A',
        duration_seconds: 2400,
        started_at: '2025-03-11T09:30:00Z',
      },
      {
        grade: 'B',
        duration_seconds: 1800,
        started_at: '2025-03-12T20:00:00Z',
      },
    ];

    const scoreData = [
      { score: 600, created_at: '2025-03-01T00:00:00Z' },
      { score: 650, created_at: '2025-03-31T00:00:00Z' },
    ];

    const factors = { consistency: { score: 85 }, recency: { score: 40 } };

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
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({ data: sessions, error: null }),
          }),
        }),
      })
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

    expect(result.bestFocusWindow).toContain('Morning');
    expect(result.bestFocusWindow).toContain('9');
  });

  it('computes strongestPattern and weakestPattern from factors', async () => {
    const sessions = [
      {
        grade: 'A',
        duration_seconds: 2400,
        started_at: '2025-03-10T09:00:00Z',
      },
    ];
    const scoreData = [{ score: 600, created_at: '2025-03-01T00:00:00Z' }];
    const factors = {
      consistency: { score: 90 },
      streakStability: { score: 70 },
      sessionQuality: { score: 50 },
      recency: { score: 30 },
    };

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
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({ data: sessions, error: null }),
          }),
        }),
      })
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

    expect(result.strongestPattern).toBe('Consistency');
    expect(result.weakestPattern).toBe('Recency');
  });
});
