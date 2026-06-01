const mockRpc = jest.fn();
const mockUpsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockGetUser = jest.fn();

jest.mock('../repository', () => {
  const actual = jest.requireActual('../repository');
  return {
    ...actual,
    getSupabase: jest.fn(() => ({
      from: jest.fn(() => ({
        upsert: mockUpsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle,
          }),
        }),
      })),
      rpc: mockRpc,
      auth: {
        getUser: mockGetUser,
      },
    })),
  };
});

import { RepositoryError } from '../repository';
import {
  hasEnoughBalance,
  spendCurrency,
  addCurrency,
} from '../service';

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

describe('spendCurrency (service)', () => {
  it('returns true on successful spend', async () => {
    mockRpc.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    const result = await spendCurrency({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      currency: 'COINS',
      amount: 50,
      sink: 'shop',
    });
    expect(result).toBe(true);
  });

  it('throws RepositoryError on rpc error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'rpc failed', code: 'P0001' },
    });

    await expect(
      spendCurrency({
        userId: '550e8400-e29b-41d4-a716-446655440001',
        currency: 'COINS',
        amount: 50,
        sink: 'shop',
      }),
    ).rejects.toThrow(RepositoryError);
  });

  it('validates input via SpendInputSchema', async () => {
    await expect(
      spendCurrency({
        userId: 'invalid-uuid',
        currency: 'COINS',
        amount: 50,
        sink: 'shop',
      }),
    ).rejects.toThrow();
  });
});

describe('addCurrency (service)', () => {
  it('resolves on success', async () => {
    mockRpc.mockResolvedValue({ error: null });

    await expect(
      addCurrency(
        '550e8400-e29b-41d4-a716-446655440001',
        100,
        'COINS',
        'session_complete',
      ),
    ).resolves.toBeUndefined();
  });

  it('throws RepositoryError on error', async () => {
    mockRpc.mockResolvedValue({
      error: { message: 'insert failed', code: '23503' },
    });

    await expect(
      addCurrency(
        '550e8400-e29b-41d4-a716-446655440001',
        100,
        'COINS',
        'session_complete',
      ),
    ).rejects.toThrow(RepositoryError);
  });
});
