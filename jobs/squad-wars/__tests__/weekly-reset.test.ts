import { jest } from '@jest/globals';

type SupabaseResponse = {
  data?: unknown;
  error?: unknown;
};

const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  lt: jest.fn(() => mockSupabaseClient),
  in: jest.fn(() => mockSupabaseClient),
  maybeSingle: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => mockSupabaseClient),
  then: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

jest.mock('@trigger.dev/sdk', () => ({
  task: jest.fn((config: unknown) => config),
}));

const { squadWarWeeklyReset } = require('../weekly-reset');

const mockWarRow = {
  id: 'war-001',
  squad_id: 'squad-001',
  boss_name: 'The Iron Leviathan',
  boss_max_health: 120000,
  boss_current_health: 40000,
  reward_multiplier: 1.5,
  week_starts_at: '2024-01-01T00:00:00Z',
  week_ends_at: '2024-01-07T23:59:59Z',
};

const mockWalletRow = {
  id: 'wallet-001',
  coins: 1000,
  total_coins_earned: 5000,
};

const mockPushTokens = [
  { user_id: 'user-001', token: 'token-001', platform: 'ios' },
  { user_id: 'user-002', token: 'token-002', platform: 'android' },
];

function queueSupabaseResponses(responses: SupabaseResponse[]): void {
  let callIndex = 0;
  mockSupabaseClient.then.mockImplementation((resolve: (value: SupabaseResponse) => unknown) => {
    const response = responses[callIndex] ?? { data: [], error: null };
    callIndex += 1;
    return Promise.resolve(resolve(response));
  });
}

function createIo(): { runTask: jest.Mock<Promise<unknown>, [string, () => Promise<unknown>]> } {
  return {
    runTask: jest.fn((name: string, fn: () => Promise<unknown>) => fn()),
  };
}

describe('squadWarWeeklyReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('returns an empty result when no wars expired', async () => {
    queueSupabaseResponses([{ data: [], error: null }]);

    const result = await squadWarWeeklyReset.run({}, createIo());

    expect(result).toEqual({
      processedWars: 0,
      winners: 0,
      losers: 0,
      rewardsGranted: 0,
      notificationsSent: 0,
      nextWarsCreated: 0,
    });
  });

  it('throws database errors while fetching expired wars', async () => {
    queueSupabaseResponses([{ data: null, error: new Error('Database connection failed') }]);

    await expect(squadWarWeeklyReset.run({}, createIo())).rejects.toThrow('Database connection failed');
  });

  it('rewards top contributors, creates next wars, and sends notifications', async () => {
    const wars = [
      { ...mockWarRow, id: 'war-001', squad_id: 'squad-a' },
      { ...mockWarRow, id: 'war-002', squad_id: 'squad-b' },
    ];

    queueSupabaseResponses([
      { data: wars, error: null },
      { data: [{ user_id: 'user-001', damage: 10000, session_id: 's1' }], error: null },
      { data: mockWalletRow, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: mockPushTokens, error: null },
      { data: [{ user_id: 'user-002', damage: 5000, session_id: 's2' }], error: null },
      { data: mockWalletRow, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: mockPushTokens, error: null },
    ]);

    const result = await squadWarWeeklyReset.run({}, createIo());

    expect(result.processedWars).toBe(2);
    expect(result.winners).toBe(2);
    expect(result.losers).toBe(0);
    expect(result.rewardsGranted).toBe(2);
    expect(result.notificationsSent).toBe(4);
    expect(result.nextWarsCreated).toBe(2);
  });

  it('skips rewards and notifications when a war has no damage', async () => {
    queueSupabaseResponses([
      { data: [{ ...mockWarRow }], error: null },
      { data: [], error: null },
      { data: null, error: null },
      { data: null, error: null },
    ]);

    const result = await squadWarWeeklyReset.run({}, createIo());

    expect(result.rewardsGranted).toBe(0);
    expect(result.notificationsSent).toBe(0);
    expect(result.nextWarsCreated).toBe(1);
  });

  it('creates a wallet before rewarding users without one', async () => {
    queueSupabaseResponses([
      { data: [{ ...mockWarRow }], error: null },
      { data: [{ user_id: 'user-001', damage: 5000, session_id: 's1' }], error: null },
      { data: null, error: null },
      { data: { id: 'new-wallet' }, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: mockPushTokens, error: null },
    ]);

    const result = await squadWarWeeklyReset.run({}, createIo());

    expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-001' }));
    expect(result.rewardsGranted).toBe(1);
  });

  it('rejects malformed array responses before iterating', async () => {
    queueSupabaseResponses([
      { data: [{ ...mockWarRow }], error: null },
      { data: { user_id: 'user-001', damage: 5000 }, error: null },
    ]);

    await expect(squadWarWeeklyReset.run({}, createIo())).rejects.toThrow(
      'fetchWarLeaderboard expected an array response'
    );
  });
});
