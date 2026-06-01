import { jest } from '@jest/globals';

let mockSupabaseClient: unknown;

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

export function resetMockClient(): void {
  mockSupabaseClient = undefined;
}

export const userId = '123e4567-e89b-12d3-a456-426614174000';

export const factors = {
  consistency: {
    weightPercent: 35,
    score: 80,
    delta: 4,
    explanation: 'Consistent completions.',
  },
  streakStability: {
    weightPercent: 25,
    score: 70,
    delta: 2,
    explanation: 'Steady streak.',
  },
  sessionQuality: {
    weightPercent: 20,
    score: 85,
    delta: 5,
    explanation: 'High-quality sessions.',
  },
  intentionalDifficulty: {
    weightPercent: 7,
    score: 60,
    delta: 1,
    explanation: 'Moderate challenge.',
  },
  contractCompletion: {
    weightPercent: 8,
    score: 50,
    delta: 0,
    explanation: 'Contract completion is neutral.',
  },
  recency: {
    weightPercent: 5,
    score: 75,
    delta: 3,
    explanation: 'Recent activity.',
  },
} as const;

export const currentRow = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  user_id: userId,
  current_score: 620,
  previous_score: 611,
  band: 'Strong',
  factors,
  last_change_reason: 'Session completed',
  created_at: '2026-05-06T00:00:00.000Z',
  updated_at: '2026-05-06T01:00:00.000Z',
};

export function makeQuery(response: unknown): Record<string, jest.Mock> {
  const query: Record<string, jest.Mock> = {};
  query.select = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.gte = jest.fn(() => query);
  query.lt = jest.fn(() => query);
  query.order = jest.fn(() => response);
  query.single = jest.fn(() => response);
  query.upsert = jest.fn(() => query);
  query.insert = jest.fn(() => query);
  return query;
}

export function makeLtQuery(response: unknown): Record<string, jest.Mock> {
  const query = makeQuery(response);
  query.lt = jest.fn(() => response);
  return query;
}

export function useQueries(
  ...queries: Array<Record<string, jest.Mock>>
): jest.Mock {
  const from = jest.fn();
  queries.forEach((query) => from.mockReturnValueOnce(query));
  mockSupabaseClient = { from };
  return from;
}
