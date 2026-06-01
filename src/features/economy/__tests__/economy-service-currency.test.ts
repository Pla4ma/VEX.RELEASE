const mockSingle = jest.fn();
const mockGetUser = jest.fn();

const mockSupabaseClient = {
  from: jest.fn(() => ({
    upsert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: mockSingle,
      }),
    }),
  })),
  auth: {
    getUser: mockGetUser,
  },
};

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('../repository', () => {
  const actual = jest.requireActual('../repository');
  return {
    ...actual,
    getSupabase: jest.fn(() => mockSupabaseClient),
  };
});

import { hasEnoughBalance } from '../service';
import { spendCurrency, addCurrency } from '../wallet-service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('hasEnoughBalance', () => {
  it('returns true when coins >= amount', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        coins: 100,
        gems: 5,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    expect(
      await hasEnoughBalance('550e8400-e29b-41d4-a716-446655440001', 50),
    ).toBe(true);
  });

  it('returns false when coins < amount', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        coins: 10,
        gems: 5,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    expect(
      await hasEnoughBalance('550e8400-e29b-41d4-a716-446655440001', 50),
    ).toBe(false);
  });

  it('checks gems when currency is GEMS', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        coins: 0,
        gems: 10,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    expect(
      await hasEnoughBalance(
        '550e8400-e29b-41d4-a716-446655440001',
        5,
        'GEMS',
      ),
    ).toBe(true);
  });

  it('defaults to COINS currency', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        coins: 5,
        gems: 100,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    expect(
      await hasEnoughBalance('550e8400-e29b-41d4-a716-446655440001', 10),
    ).toBe(false);
  });
});

describe('spendCurrency (wallet-service) — ARCH-04 no-op', () => {
  it('always returns {success: false} (currency disabled)', async () => {
    const result = await spendCurrency({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      currency: 'COINS',
      amount: 50,
      sink: 'shop',
    });
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Currency system is disabled');
  });
});

describe('addCurrency (wallet-service) — ARCH-04 no-op', () => {
  it('always returns false (currency disabled)', async () => {
    const result = await addCurrency({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 100,
      currency: 'COINS',
      source: 'session_complete',
    });
    expect(result).toBe(false);
  });
});
