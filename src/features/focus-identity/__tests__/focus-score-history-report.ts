import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  appendFocusScoreHistory,
  fetchFocusScoreHistory,
  fetchMonthlyFocusReportInput,
} from '../repository-focus-score';
import {
  userId,
  makeQuery,
  makeLtQuery,
  useQueries,
  resetMockClient,
} from './focus-score-test-helpers';

describe('focus identity repository - history and reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockClient();
  });

  it('appendFocusScoreHistory returns parsed history point on success', async () => {
    useQueries(
      makeQuery({
        data: {
          user_id: userId,
          occurred_at: '2026-05-06T02:00:00.000Z',
          score: 630,
          delta: 10,
          reason: 'Session completed',
        },
        error: null,
      }),
    );
    await expect(
      appendFocusScoreHistory({
        userId,
        timestamp: '2026-05-06T02:00:00.000Z',
        score: 630,
        delta: 10,
        reason: 'Session completed',
      }),
    ).resolves.toMatchObject({ score: 630, delta: 10 });
  });

  it('appendFocusScoreHistory throws typed repository error on Supabase error', async () => {
    useQueries(makeQuery({ data: null, error: { message: 'insert failed' } }));
    await expect(
      appendFocusScoreHistory({
        userId,
        timestamp: '2026-05-06T02:00:00.000Z',
        score: 630,
        delta: 10,
        reason: 'Session completed',
      }),
    ).rejects.toThrow('appendFocusScoreHistory');
  });

  it('fetchFocusScoreHistory returns empty and parsed history arrays', async () => {
    useQueries(
      makeQuery({
        data: [
          {
            user_id: userId,
            occurred_at: '2026-05-06T02:00:00.000Z',
            score: 630,
            delta: 10,
            reason: 'Session completed',
          },
        ],
        error: null,
      }),
    );
    await expect(fetchFocusScoreHistory(userId, 30)).resolves.toEqual([
      {
        timestamp: '2026-05-06T02:00:00.000Z',
        score: 630,
        delta: 10,
        reason: 'Session completed',
      },
    ]);

    useQueries(makeQuery({ data: [], error: null }));
    await expect(fetchFocusScoreHistory(userId, 30)).resolves.toEqual([]);
  });

  it('fetchMonthlyFocusReportInput returns month-scoped aggregate data', async () => {
    useQueries(
      makeQuery({
        data: [
          {
            user_id: userId,
            occurred_at: '2026-05-06T02:00:00.000Z',
            score: 630,
            delta: 10,
            reason: 'Session completed',
          },
        ],
        error: null,
      }),
      makeLtQuery({
        data: [
          {
            duration: 1800,
            effective_duration: 1500,
            quality_score: 88,
            status: 'completed',
            completed_at: '2026-05-05T00:00:00.000Z',
          },
        ],
        error: null,
      }),
    );
    await expect(
      fetchMonthlyFocusReportInput(userId, '2026-05'),
    ).resolves.toMatchObject({
      userId,
      month: '2026-05',
      sessionsCompleted: 1,
      totalFocusedMinutes: 25,
      bestGrade: 'A',
    });
  });

  it('fetchMonthlyFocusReportInput throws on invalid month and Supabase error', async () => {
    await expect(
      fetchMonthlyFocusReportInput(userId, '2026-5'),
    ).rejects.toThrow();

    useQueries(makeQuery({ data: null, error: { message: 'history failed' } }));
    await expect(
      fetchMonthlyFocusReportInput(userId, '2026-05'),
    ).rejects.toThrow('history');
  });
});
