/**
 * Tests for economy service: balance checks, spending, and adding currency
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
  hasEnoughBalance,
  spendCurrency,
  addCurrency,
} from "../service";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("hasEnoughBalance", () => {
  beforeEach(() => {
    mockSingle.mockResolvedValue({
      data: {
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 100,
        gems: 50,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });
  });

  it("returns true when coins >= amount", async () => {
    expect(await hasEnoughBalance(VALID_UUID2, 50)).toBe(true);
  });

  it("returns true when coins == amount (exact balance)", async () => {
    expect(await hasEnoughBalance(VALID_UUID2, 100)).toBe(true);
  });

  it("returns false when coins < amount", async () => {
    expect(await hasEnoughBalance(VALID_UUID2, 101)).toBe(false);
  });

  it("returns true when gems >= amount for GEMS currency", async () => {
    expect(await hasEnoughBalance(VALID_UUID2, 30, "GEMS")).toBe(true);
  });

  it("returns false when gems < amount for GEMS currency", async () => {
    expect(await hasEnoughBalance(VALID_UUID2, 60, "GEMS")).toBe(false);
  });

  it("defaults to COINS when currency is not specified", async () => {
    // coins=100, check for 101 -> false (checks coins, not gems)
    expect(await hasEnoughBalance(VALID_UUID2, 101)).toBe(false);
  });
});

describe("spendCurrency (service)", () => {
  it("returns true on successful spend", async () => {
    mockRpc.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    const result = await spendCurrency({
      userId: VALID_UUID2,
      currency: "COINS",
      amount: 50,
      sink: "shop",
    });
    expect(result).toBe(true);
  });

  it("returns false when rpc returns success: false", async () => {
    mockRpc.mockResolvedValue({
      data: { success: false },
      error: null,
    });

    const result = await spendCurrency({
      userId: VALID_UUID2,
      currency: "COINS",
      amount: 50,
      sink: "shop",
    });
    expect(result).toBe(false);
  });

  it("throws RepositoryError on rpc error", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "rpc failed", code: "P0001" },
    });

    await expect(
      spendCurrency({
        userId: VALID_UUID2,
        currency: "COINS",
        amount: 50,
        sink: "shop",
      }),
    ).rejects.toThrow(RepositoryError);
  });

  it("validates input via SpendInputSchema", async () => {
    await expect(
      spendCurrency({
        userId: "invalid-uuid",
        currency: "COINS",
        amount: 50,
        sink: "shop",
      }),
    ).rejects.toThrow();
  });
});

describe("addCurrency (service)", () => {
  it("resolves void on success", async () => {
    mockRpc.mockResolvedValue({ error: null });

    await expect(
      addCurrency(VALID_UUID2, 100, "COINS", "session_complete"),
    ).resolves.toBeUndefined();
  });

  it("throws RepositoryError on error", async () => {
    mockRpc.mockResolvedValue({
      error: { message: "insert failed", code: "23503" },
    });

    await expect(
      addCurrency(VALID_UUID2, 100, "COINS", "session_complete"),
    ).rejects.toThrow(RepositoryError);
  });

  it("calls rpc with correct parameters", async () => {
    mockRpc.mockResolvedValue({ error: null });

    await addCurrency(VALID_UUID2, 200, "GEMS", "daily_reward");
    expect(mockRpc).toHaveBeenCalledWith("atomic_add_currency", {
      p_user_id: VALID_UUID2,
      p_currency: "GEMS",
      p_amount: 200,
      p_source: "daily_reward",
    });
  });
});
