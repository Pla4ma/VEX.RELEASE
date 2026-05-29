/**
 * Comprehensive tests for the economy feature
 * Covers: types, schemas, repository, service, wallet-service,
 * StreakInsurance, hooks, components, index exports
 */

// ── Types ──────────────────────────────────────────────────────────

import type { WalletSummary, SpendError, SpendErrorCode } from "../types";

describe("economy types", () => {
  it("WalletSummary has coins and gems", () => {
    const wallet: WalletSummary = { coins: 100, gems: 5 };
    expect(wallet.coins).toBe(100);
    expect(wallet.gems).toBe(5);
  });

  it("WalletSummary allows zero values", () => {
    const wallet: WalletSummary = { coins: 0, gems: 0 };
    expect(wallet.coins).toBe(0);
    expect(wallet.gems).toBe(0);
  });

  it("SpendError has code and message", () => {
    const error: SpendError = {
      code: "INSUFFICIENT_BALANCE",
      message: "Not enough coins",
    };
    expect(error.code).toBe("INSUFFICIENT_BALANCE");
    expect(error.message).toBe("Not enough coins");
  });

  it("SpendErrorCode covers all expected values", () => {
    const codes: SpendErrorCode[] = [
      "INSUFFICIENT_BALANCE",
      "INVALID_CURRENCY",
      "DB_ERROR",
    ];
    expect(codes).toHaveLength(3);
  });

  it("SpendError accepts all SpendErrorCode values", () => {
    const errors: SpendError[] = [
      { code: "INSUFFICIENT_BALANCE", message: "m1" },
      { code: "INVALID_CURRENCY", message: "m2" },
      { code: "DB_ERROR", message: "m3" },
    ];
    expect(errors).toHaveLength(3);
  });
});

// ── Schemas ────────────────────────────────────────────────────────

import {
  WalletSchema,
  CurrencyTypeSchema,
  SpendInputSchema,
  CurrencyGrantSchema,
} from "../schemas";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID2 = "550e8400-e29b-41d4-a716-446655440001";

describe("WalletSchema", () => {
  it("validates a complete wallet object", () => {
    const result = WalletSchema.parse({
      id: VALID_UUID,
      user_id: VALID_UUID2,
      coins: 100,
      gems: 10,
      created_at: 1000,
      updated_at: 2000,
    });
    expect(result.coins).toBe(100);
    expect(result.gems).toBe(10);
  });

  it("accepts zero coins and gems", () => {
    const result = WalletSchema.parse({
      id: VALID_UUID,
      user_id: VALID_UUID2,
      coins: 0,
      gems: 0,
      created_at: 1000,
      updated_at: 1000,
    });
    expect(result.coins).toBe(0);
    expect(result.gems).toBe(0);
  });

  it("rejects negative coins", () => {
    expect(() =>
      WalletSchema.parse({
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: -1,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects negative gems", () => {
    expect(() =>
      WalletSchema.parse({
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 0,
        gems: -5,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects non-UUID id", () => {
    expect(() =>
      WalletSchema.parse({
        id: "not-a-uuid",
        user_id: VALID_UUID2,
        coins: 0,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects non-UUID user_id", () => {
    expect(() =>
      WalletSchema.parse({
        id: VALID_UUID,
        user_id: "bad-uuid",
        coins: 0,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects non-integer coins", () => {
    expect(() =>
      WalletSchema.parse({
        id: VALID_UUID,
        user_id: VALID_UUID2,
        coins: 1.5,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });
});

describe("CurrencyTypeSchema", () => {
  it.each(["COINS", "GEMS", "XP", "SEASONAL", "FOCUS_POINTS"])(
    "accepts '%s'",
    (currency) => {
      expect(CurrencyTypeSchema.parse(currency)).toBe(currency);
    },
  );

  it("rejects unknown currency types", () => {
    expect(() => CurrencyTypeSchema.parse("DIAMONDS")).toThrow();
    expect(() => CurrencyTypeSchema.parse("")).toThrow();
    expect(() => CurrencyTypeSchema.parse("coins")).toThrow();
  });
});

describe("SpendInputSchema", () => {
  const validInput = {
    userId: VALID_UUID,
    currency: "COINS" as const,
    amount: 50,
    sink: "shop_purchase",
  };

  it("validates a minimal spend input", () => {
    const result = SpendInputSchema.parse(validInput);
    expect(result.amount).toBe(50);
    expect(result.sink).toBe("shop_purchase");
    expect(result.currency).toBe("COINS");
  });

  it("accepts optional description and metadata", () => {
    const result = SpendInputSchema.parse({
      ...validInput,
      description: "Bought sword",
      metadata: { itemId: "sword-1", rarity: "epic" },
    });
    expect(result.description).toBe("Bought sword");
    expect(result.metadata).toEqual({ itemId: "sword-1", rarity: "epic" });
  });

  it("rejects zero amount", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, amount: 0 }),
    ).toThrow();
  });

  it("rejects negative amount", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, amount: -10 }),
    ).toThrow();
  });

  it("rejects empty sink", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, sink: "" }),
    ).toThrow();
  });

  it("rejects non-UUID userId", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, userId: "bad" }),
    ).toThrow();
  });

  it("rejects invalid currency", () => {
    expect(() =>
      SpendInputSchema.parse({ ...validInput, currency: "INVALID" }),
    ).toThrow();
  });
});

describe("CurrencyGrantSchema", () => {
  const validGrant = {
    userId: VALID_UUID,
    amount: 100,
    currency: "COINS" as const,
    source: "session_complete",
  };

  it("validates a minimal grant", () => {
    const result = CurrencyGrantSchema.parse(validGrant);
    expect(result.amount).toBe(100);
    expect(result.source).toBe("session_complete");
  });

  it("accepts all optional fields", () => {
    const result = CurrencyGrantSchema.parse({
      ...validGrant,
      sourceId: "session-123",
      description: "Session reward",
      skipEvents: true,
      metadata: { bonus: true },
    });
    expect(result.sourceId).toBe("session-123");
    expect(result.description).toBe("Session reward");
    expect(result.skipEvents).toBe(true);
    expect(result.metadata).toEqual({ bonus: true });
  });

  it("accepts null sourceId", () => {
    const result = CurrencyGrantSchema.parse({
      ...validGrant,
      sourceId: null,
    });
    expect(result.sourceId).toBeNull();
  });

  it("rejects zero amount", () => {
    expect(() =>
      CurrencyGrantSchema.parse({ ...validGrant, amount: 0 }),
    ).toThrow();
  });

  it("rejects empty source", () => {
    expect(() =>
      CurrencyGrantSchema.parse({ ...validGrant, source: "" }),
    ).toThrow();
  });

  it("rejects non-UUID userId", () => {
    expect(() =>
      CurrencyGrantSchema.parse({ ...validGrant, userId: "bad" }),
    ).toThrow();
  });
});

// ── Repository ─────────────────────────────────────────────────────

import { RepositoryError, getSupabase } from "../repository";

describe("RepositoryError", () => {
  it("constructs with operation name and Error cause", () => {
    const cause = new Error("connection failed");
    const error = new RepositoryError("fetchWallet", cause);
    expect(error.name).toBe("RepositoryError");
    expect(error.operation).toBe("fetchWallet");
    expect(error.message).toContain("fetchWallet");
    expect(error.message).toContain("connection failed");
    expect(error.cause).toBe(cause);
  });

  it("is an instance of Error", () => {
    const error = new RepositoryError("op", new Error("fail"));
    expect(error).toBeInstanceOf(Error);
  });

  it("preserves the operation field", () => {
    const error = new RepositoryError("spendCurrency", new Error("db down"));
    expect(error.operation).toBe("spendCurrency");
  });

  it("constructs with PostgrestError-like cause", () => {
    const pgError = {
      message: "duplicate key",
      code: "23505",
      details: "",
      hint: "",
    };
    const error = new RepositoryError("upsert", pgError as any);
    expect(error.cause).toBe(pgError);
    expect(error.message).toContain("duplicate key");
  });
});

// ── Service ────────────────────────────────────────────────────────

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
  hasEnoughBalance,
  spendCurrency,
  addCurrency,
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

// ── Wallet Service ─────────────────────────────────────────────────

import {
  addCurrency as walletAddCurrency,
  spendCurrency as walletSpendCurrency,
} from "../wallet-service";
import type { CurrencyGrant, SpendRequest } from "../wallet-service";

describe("wallet-service exports", () => {
  it("exports addCurrency function", () => {
    expect(typeof walletAddCurrency).toBe("function");
  });

  it("exports spendCurrency function", () => {
    expect(typeof walletSpendCurrency).toBe("function");
  });

  it("CurrencyGrant interface has expected shape", () => {
    const grant: CurrencyGrant = {
      userId: VALID_UUID2,
      amount: 100,
      currency: "COINS",
      source: "test",
    };
    expect(grant.userId).toBe(VALID_UUID2);
    expect(grant.amount).toBe(100);
  });

  it("SpendRequest interface has expected shape", () => {
    const req: SpendRequest = {
      userId: VALID_UUID2,
      currency: "COINS",
      amount: 50,
      sink: "shop",
    };
    expect(req.sink).toBe("shop");
  });
});

// ── StreakInsurance ────────────────────────────────────────────────

import {
  getInsuranceStatus,
  consumeInsurance,
} from "../StreakInsurance";
import type { StreakInsuranceStatus, ConsumeInsuranceInput } from "../StreakInsurance";

describe("getInsuranceStatus", () => {
  it("returns not insured with 0 days remaining", () => {
    const status = getInsuranceStatus();
    expect(status.isInsured).toBe(false);
    expect(status.daysRemaining).toBe(0);
  });

  it("returns StreakInsuranceStatus shape", () => {
    const status: StreakInsuranceStatus = getInsuranceStatus();
    expect(status).toHaveProperty("isInsured");
    expect(status).toHaveProperty("daysRemaining");
  });
});

describe("consumeInsurance", () => {
  it("returns failed status with all expected fields", async () => {
    const result = await consumeInsurance({
      userId: "user-1",
      insuranceId: "ins-1",
    });
    expect(result.isInsured).toBe(false);
    expect(result.daysRemaining).toBe(0);
    expect(result.success).toBe(false);
    expect(result.restoredDays).toBe(0);
  });

  it("works with any input values", async () => {
    const result = await consumeInsurance({
      userId: "any-user",
      insuranceId: "any-insurance",
    });
    expect(result.success).toBe(false);
  });
});

// ── Hooks ──────────────────────────────────────────────────────────

import { useWallet, useBalance, economyKeys } from "../hooks/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useWallet", () => {
  it("returns zeroed wallet data", async () => {
    const { result } = renderHook(() => useWallet("user-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ coins: 0, gems: 0 });
  });

  it("is disabled when userId is null", () => {
    const { result } = renderHook(() => useWallet(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });

  it("is disabled when userId is undefined", () => {
    const { result } = renderHook(() => useWallet(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });

  it("is disabled when options.enabled is false", () => {
    const { result } = renderHook(
      () => useWallet("user-1", { enabled: false }),
      { wrapper: createWrapper() },
    );
    expect(result.current.isFetching).toBe(false);
  });

  it("is enabled when options.enabled is true and userId present", async () => {
    const { result } = renderHook(
      () => useWallet("user-1", { enabled: true }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ coins: 0, gems: 0 });
  });
});

describe("useBalance", () => {
  it("returns 0 balance", async () => {
    const { result } = renderHook(() => useBalance("user-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });

  it("is disabled when userId is null", () => {
    const { result } = renderHook(() => useBalance(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });

  it("is disabled when userId is undefined", () => {
    const { result } = renderHook(() => useBalance(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });

  it("accepts optional currency parameter", async () => {
    const { result } = renderHook(() => useBalance("user-1", "GEMS"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });
});

describe("economyKeys", () => {
  it("has 'all' key", () => {
    expect(economyKeys.all).toEqual(["economy"]);
  });

  it("wallet generates key with userId", () => {
    expect(economyKeys.wallet("user-1")).toEqual([
      "economy",
      "wallet",
      "user-1",
    ]);
  });

  it("wallet generates different key for different userId", () => {
    expect(economyKeys.wallet("user-2")).toEqual([
      "economy",
      "wallet",
      "user-2",
    ]);
  });

  it("transactions generates key with userId", () => {
    expect(economyKeys.transactions("user-2")).toEqual([
      "economy",
      "transactions",
      "user-2",
    ]);
  });

  it("keys are tuples (arrays)", () => {
    expect(Array.isArray(economyKeys.all)).toBe(true);
    expect(Array.isArray(economyKeys.wallet("u1"))).toBe(true);
    expect(Array.isArray(economyKeys.transactions("u1"))).toBe(true);
  });
});

// ── Index exports ──────────────────────────────────────────────────

import * as economyIndex from "../index";

describe("economy index exports", () => {
  it("exports SimpleWalletBadge component", () => {
    expect(economyIndex.SimpleWalletBadge).toBeDefined();
  });

  it("exports useWallet hook", () => {
    expect(typeof economyIndex.useWallet).toBe("function");
  });

  it("exports addCurrency from wallet-service", () => {
    expect(typeof economyIndex.addCurrency).toBe("function");
  });

  it("exports spendCurrency from wallet-service", () => {
    expect(typeof economyIndex.spendCurrency).toBe("function");
  });

  it("exports getInsuranceStatus from StreakInsurance", () => {
    expect(typeof economyIndex.getInsuranceStatus).toBe("function");
  });
});
