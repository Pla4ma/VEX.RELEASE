import { fetchXpHistory } from '../xp-history';

type QueryRecorder = {
  eq: jest.Mock;
  gte: jest.Mock;
  limit: jest.Mock;
  select: jest.Mock;
};

let mockQuery: QueryRecorder | null = null;

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => mockQuery,
  }),
}));

const USER_ID = '11111111-1111-4111-8111-111111111111';

function createQuery(): QueryRecorder {
  const query: QueryRecorder = {
    eq: jest.fn(),
    gte: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.gte.mockReturnValue(query);
  query.limit.mockResolvedValue({
    data: [
      {
        id: '22222222-2222-4222-8222-222222222222',
        amount: 50,
        source: 'SESSION_COMPLETE',
        session_id: null,
        idempotency_key: null,
        metadata: null,
        created_at: Date.now(),
      },
    ],
    error: null,
  });
  return query;
}

describe('fetchXpHistory ownership', () => {
  beforeEach(() => {
    mockQuery = null;
  });

  it('filters XP history by the requested user before returning rows', async () => {
    const query = createQuery();
    mockQuery = query;

    await fetchXpHistory(USER_ID);

    expect(query.eq).toHaveBeenCalledWith('user_id', USER_ID);
  });
});
