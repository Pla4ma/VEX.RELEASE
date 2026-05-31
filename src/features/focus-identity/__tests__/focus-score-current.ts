import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  fetchCurrentFocusScore,
  upsertCurrentFocusScore,
} from '../repository-focus-score';
import {
  userId,
  factors,
  currentRow,
  makeQuery,
  useQueries,
  resetMockClient,
} from './focus-score-test-helpers';

describe('focus identity repository - current score', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockClient();
  });

  it('fetchCurrentFocusScore returns parsed score record on success', async () => {
    useQueries(makeQuery({ data: currentRow, error: null }));
    await expect(fetchCurrentFocusScore(userId)).resolves.toMatchObject({
      userId,
      currentScore: 620,
      band: 'Strong',
    });
  });

  it('fetchCurrentFocusScore returns null when the user has no score', async () => {
    useQueries(
      makeQuery({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      }),
    );
    await expect(fetchCurrentFocusScore(userId)).resolves.toBeNull();
  });

  it('fetchCurrentFocusScore throws typed repository error on Supabase error', async () => {
    useQueries(
      makeQuery({
        data: null,
        error: { code: '500', message: 'db unavailable' },
      }),
    );
    await expect(fetchCurrentFocusScore(userId)).rejects.toThrow(
      'fetchCurrentFocusScore',
    );
  });

  it('fetchCurrentFocusScore rejects invalid response shape', async () => {
    useQueries(
      makeQuery({ data: { ...currentRow, id: 'invalid' }, error: null }),
    );
    await expect(fetchCurrentFocusScore(userId)).rejects.toThrow();
  });

  it('upsertCurrentFocusScore returns parsed score record on success', async () => {
    useQueries(
      makeQuery({
        data: { ...currentRow, current_score: 631, previous_score: 620 },
        error: null,
      }),
    );
    await expect(
      upsertCurrentFocusScore(userId, {
        currentScore: 631,
        previousScore: 620,
        band: 'Strong',
        factors,
        lastChangeReason: 'Session completed',
      }),
    ).resolves.toMatchObject({ currentScore: 631, previousScore: 620 });
  });

  it('upsertCurrentFocusScore resolves conflict by returning existing score', async () => {
    useQueries(
      makeQuery({ data: null, error: { code: '23505', message: 'conflict' } }),
      makeQuery({
        data: { ...currentRow, current_score: 630, previous_score: 620 },
        error: null,
      }),
    );
    await expect(
      upsertCurrentFocusScore(userId, {
        currentScore: 631,
        previousScore: 620,
        band: 'Strong',
        factors,
        lastChangeReason: 'Session completed',
      }),
    ).resolves.toMatchObject({ currentScore: 630 });
  });
});
