/**
 * Tests for economy service: wallet retrieval and balance
 */

import { RepositoryError } from "../repository";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID2 = "550e8400-e29b-41d4-a716-446655440001";

// Mock supabase client
const mockRpc = jest.fn();
const mockUpsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockGetUser = jest.fn();

jest.mock("../repository", () => {
  const actual = jest.requireActual("../repository");
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

import {
  getOrCreateWallet,
  getWalletSummary,
  getBalance,
} from "../service";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getOrCreateWallet", () => {
  it("returns wallet coins and gems on success", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 150,
        gems: 7,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const wallet = await getOrCreateWallet(VALID_UUID2);
    expect(wallet.coins).toBe(150);
    expect(wallet.gems).toBe(7);
  });

  it("throws RepositoryError on supabase error", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "duplicate key", code: "23505" },
    });

    await expect(getOrCreateWallet(VALID_UUID2)).rejects.toThrow(
      RepositoryError,
    );
  });

  it("throws on invalid wallet data from database", async () => {
    mockSingle.mockResolvedValue({
      data: { invalid: true },
      error: null,
    });

    await expect(getOrCreateWallet(VALID_UUID2)).rejects.toThrow();
  });

  it("returns zeroed wallet when DB returns zero values", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 0,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const wallet = await getOrCreateWallet(VALID_UUID2);
    expect(wallet.coins).toBe(0);
    expect(wallet.gems).toBe(0);
  });
});

describe("getWalletSummary", () => {
  it("returns {coins:0, gems:0} when no user is authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const summary = await getWalletSummary();
    expect(summary).toEqual({ coins: 0, gems: 0 });
  });

  it("returns wallet data when user is authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_UUID2 } },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: {
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 200,
        gems: 15,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const summary = await getWalletSummary();
    expect(summary.coins).toBe(200);
    expect(summary.gems).toBe(15);
  });
});

describe("getBalance", () => {
  it("returns coins from wallet", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 500,
        gems: 20,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const balance = await getBalance(VALID_UUID2);
    expect(balance).toBe(500);
  });

  it("returns 0 when wallet has 0 coins", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 0,
        gems: 100,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const balance = await getBalance(VALID_UUID2);
    expect(balance).toBe(0);
  });
});
