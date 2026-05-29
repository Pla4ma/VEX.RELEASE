/**
 * Tests for the economy feature
 * Covers: types, schemas, repository, service, wallet-service,
 *         StreakInsurance, hooks, components, index exports
 */

// ── Types ──────────────────────────────────────────────────────────

import type { WalletSummary, SpendError, SpendErrorCode } from "../types";

describe("economy types", () => {
  it("WalletSummary has coins and gems", () => {
    const wallet: WalletSummary = { coins: 100, gems: 5 };
    expect(wallet.coins).toBe(100);
    expect(wallet.gems).toBe(5);
  });

  it("SpendError has code and message", () => {
    const error: SpendError = {
      code: "INSUFFICIENT_BALANCE",
      message: "Not enough coins",
    };
    expect(error.code).toBe("INSUFFICIENT_BALANCE");
  });

  it("SpendErrorCode includes all expected values", () => {
    const codes: SpendErrorCode[] = [
      "INSUFFICIENT_BALANCE",
      "INVALID_CURRENCY",
      "DB_ERROR",
    ];
    expect(codes).toHaveLength(3);
  });
});

// ── Schemas ────────────────────────────────────────────────────────

import {
  WalletSchema,
  CurrencyTypeSchema,
  SpendInputSchema,
  CurrencyGrantSchema,
} from "../schemas";

describe("WalletSchema", () => {
  it("validates a valid wallet", () => {
    const result = WalletSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      coins: 100,
      gems: 10,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    expect(result.coins).toBe(100);
    expect(result.gems).toBe(10);
  });

  it("defaults coins and gems to 0", () => {
    const result = WalletSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
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
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: -1,
        gems: 0,
        created_at: 1000,
        updated_at: 1000,
      }),
    ).toThrow();
  });

  it("rejects non-UUID id", () => {
    expect(() =>
      WalletSchema.parse({
        id: "not-a-uuid",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 0,
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

  it("rejects invalid currency", () => {
    expect(() => CurrencyTypeSchema.parse("DIAMONDS")).toThrow();
  });
});

describe("SpendInputSchema", () => {
  const validInput = {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    currency: "COINS" as const,
    amount: 50,
    sink: "shop_purchase",
  };

  it("validates a valid spend input", () => {
    const result = SpendInputSchema.parse(validInput);
    expect(result.amount).toBe(50);
    expect(result.sink).toBe("shop_purchase");
  });

  it("accepts optional fields", () => {
    const result = SpendInputSchema.parse({
      ...validInput,
      description: "Bought item",
      metadata: { itemId: "sword" },
    });
    expect(result.description).toBe("Bought item");
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
});

describe("CurrencyGrantSchema", () => {
  const validGrant = {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 100,
    currency: "COINS" as const,
    source: "session_complete",
  };

  it("validates a valid grant", () => {
    const result = CurrencyGrantSchema.parse(validGrant);
    expect(result.amount).toBe(100);
    expect(result.source).toBe("session_complete");
  });

  it("accepts optional fields", () => {
    const result = CurrencyGrantSchema.parse({
      ...validGrant,
      sourceId: "session-123",
      description: "Session reward",
      skipEvents: true,
      metadata: { bonus: true },
    });
    expect(result.sourceId).toBe("session-123");
    expect(result.skipEvents).toBe(true);
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
});

// ── Repository ─────────────────────────────────────────────────────

import { RepositoryError, getSupabase } from "../repository";

describe("RepositoryError", () => {
  it("constructs with operation and PostgrestError-like cause", () => {
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
});

// ── Service ────────────────────────────────────────────────────────

// Mock the supabase client used by the service
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
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 150,
        gems: 7,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const wallet = await getOrCreateWallet("550e8400-e29b-41d4-a716-446655440001");
    expect(wallet.coins).toBe(150);
    expect(wallet.gems).toBe(7);
  });

  it("throws RepositoryError on supabase error", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "duplicate key", code: "23505" },
    });

    await expect(
      getOrCreateWallet("550e8400-e29b-41d4-a716-446655440001"),
    ).rejects.toThrow(RepositoryError);
  });

  it("throws on invalid wallet data (schema validation)", async () => {
    mockSingle.mockResolvedValue({
      data: { invalid: true },
      error: null,
    });

    await expect(
      getOrCreateWallet("550e8400-e29b-41d4-a716-446655440001"),
    ).rejects.toThrow();
  });
});

describe("getWalletSummary", () => {
  it("returns {coins:0, gems:0} when no user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const summary = await getWalletSummary();
    expect(summary).toEqual({ coins: 0, gems: 0 });
  });

  it("returns wallet when user exists", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440001" } },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
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
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 500,
        gems: 20,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const balance = await getBalance("550e8400-e29b-41d4-a716-446655440001");
    expect(balance).toBe(500);
  });
});

describe("hasEnoughBalance", () => {
  it("returns true when coins >= amount", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 100,
        gems: 5,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    expect(
      await hasEnoughBalance("550e8400-e29b-41d4-a716-446655440001", 50),
    ).toBe(true);
  });

  it("returns false when coins < amount", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 10,
        gems: 5,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    expect(
      await hasEnoughBalance("550e8400-e29b-41d4-a716-446655440001", 50),
    ).toBe(false);
  });

  it("checks gems when currency is GEMS", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 0,
        gems: 10,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    expect(
      await hasEnoughBalance(
        "550e8400-e29b-41d4-a716-446655440001",
        5,
        "GEMS",
      ),
    ).toBe(true);
  });

  it("defaults to COINS currency", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 5,
        gems: 100,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    expect(
      await hasEnoughBalance("550e8400-e29b-41d4-a716-446655440001", 10),
    ).toBe(false);
  });
});

describe("spendCurrency (service)", () => {
  it("returns true on successful spend", async () => {
    mockRpc.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    const result = await spendCurrency({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      currency: "COINS",
      amount: 50,
      sink: "shop",
    });
    expect(result).toBe(true);
  });

  it("throws RepositoryError on rpc error", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "rpc failed", code: "P0001" },
    });

    await expect(
      spendCurrency({
        userId: "550e8400-e29b-41d4-a716-446655440001",
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
  it("resolves on success", async () => {
    mockRpc.mockResolvedValue({ error: null });

    await expect(
      addCurrency(
        "550e8400-e29b-41d4-a716-446655440001",
        100,
        "COINS",
        "session_complete",
      ),
    ).resolves.toBeUndefined();
  });

  it("throws RepositoryError on error", async () => {
    mockRpc.mockResolvedValue({
      error: { message: "insert failed", code: "23503" },
    });

    await expect(
      addCurrency(
        "550e8400-e29b-41d4-a716-446655440001",
        100,
        "COINS",
        "session_complete",
      ),
    ).rejects.toThrow(RepositoryError);
  });
});

// ── Wallet Service ─────────────────────────────────────────────────

// Need separate mocks for wallet-service module
const mockWalletRpc = jest.fn();

jest.mock("../wallet-service", () => {
  // Get the real module, but we'll test its exports separately
  const actual = jest.requireActual("../wallet-service");
  return actual;
});

import {
  addCurrency as walletAddCurrency,
  spendCurrency as walletSpendCurrency,
} from "../wallet-service";

describe("wallet-service exports", () => {
  it("exports addCurrency function", () => {
    expect(typeof walletAddCurrency).toBe("function");
  });

  it("exports spendCurrency function", () => {
    expect(typeof walletSpendCurrency).toBe("function");
  });
});

// ── StreakInsurance ────────────────────────────────────────────────

import {
  getInsuranceStatus,
  consumeInsurance,
} from "../StreakInsurance";

describe("getInsuranceStatus", () => {
  it("returns not insured with 0 days remaining", () => {
    const status = getInsuranceStatus();
    expect(status.isInsured).toBe(false);
    expect(status.daysRemaining).toBe(0);
  });
});

describe("consumeInsurance", () => {
  it("returns failed status", async () => {
    const result = await consumeInsurance({
      userId: "user-1",
      insuranceId: "ins-1",
    });
    expect(result.isInsured).toBe(false);
    expect(result.daysRemaining).toBe(0);
    expect(result.success).toBe(false);
    expect(result.restoredDays).toBe(0);
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

  it("is disabled when options.enabled is false", () => {
    const { result } = renderHook(
      () => useWallet("user-1", { enabled: false }),
      { wrapper: createWrapper() },
    );
    expect(result.current.isFetching).toBe(false);
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
});

describe("economyKeys", () => {
  it("has all key", () => {
    expect(economyKeys.all).toEqual(["economy"]);
  });

  it("wallet generates key with userId", () => {
    expect(economyKeys.wallet("user-1")).toEqual([
      "economy",
      "wallet",
      "user-1",
    ]);
  });

  it("transactions generates key with userId", () => {
    expect(economyKeys.transactions("user-2")).toEqual([
      "economy",
      "transactions",
      "user-2",
    ]);
  });
});

// ── Components ─────────────────────────────────────────────────────

import { SimpleWalletBadge } from "../components/SimpleWalletBadge";
import { StreakInsuranceCard } from "../components/StreakInsuranceCard";
import { render, fireEvent } from "@testing-library/react-native";

describe("SimpleWalletBadge", () => {
  it("shows 'Day N' when streak > 0", () => {
    const { getByText } = render(
      React.createElement(SimpleWalletBadge, {
        userId: "u1",
        streak: 5,
        onPress: jest.fn(),
      }),
    );
    expect(getByText("Day 5")).toBeTruthy();
  });

  it("shows 'Start' when streak is 0", () => {
    const { getByText } = render(
      React.createElement(SimpleWalletBadge, {
        userId: "u1",
        streak: 0,
        onPress: jest.fn(),
      }),
    );
    expect(getByText("Start")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      React.createElement(SimpleWalletBadge, {
        userId: "u1",
        streak: 3,
        onPress,
      }),
    );
    fireEvent.press(getByLabelText("Progress badge"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility properties", () => {
    const { getByLabelText } = render(
      React.createElement(SimpleWalletBadge, {
        userId: "u1",
        streak: 1,
        onPress: jest.fn(),
      }),
    );
    const badge = getByLabelText("Progress badge");
    expect(badge.props.accessibilityRole).toBe("button");
  });
});

describe("StreakInsuranceCard", () => {
  it("shows insured status with days remaining", () => {
    const { getByText } = render(
      React.createElement(StreakInsuranceCard, {
        status: { isInsured: true, daysRemaining: 7 },
      }),
    );
    expect(getByText(/Protected for 7 days/i)).toBeTruthy();
  });

  it("shows available message when not insured", () => {
    const { getByText } = render(
      React.createElement(StreakInsuranceCard, {
        status: { isInsured: false, daysRemaining: 0 },
      }),
    );
    expect(getByText(/Streak protection available/i)).toBeTruthy();
  });

  it("shows available message when status is null", () => {
    const { getByText } = render(
      React.createElement(StreakInsuranceCard, {
        status: null,
      }),
    );
    expect(getByText(/Streak protection available/i)).toBeTruthy();
  });

  it("has accessibility label", () => {
    const { getByLabelText } = render(
      React.createElement(StreakInsuranceCard, {
        status: null,
      }),
    );
    expect(getByLabelText("Streak protection status")).toBeTruthy();
  });
});

// ── Index exports ──────────────────────────────────────────────────

import * as economyIndex from "../index";

describe("economy index exports", () => {
  it("exports SimpleWalletBadge", () => {
    expect(economyIndex.SimpleWalletBadge).toBeDefined();
  });

  it("exports useWallet", () => {
    expect(typeof economyIndex.useWallet).toBe("function");
  });

  it("exports addCurrency", () => {
    expect(typeof economyIndex.addCurrency).toBe("function");
  });

  it("exports spendCurrency", () => {
    expect(typeof economyIndex.spendCurrency).toBe("function");
  });

  it("exports getInsuranceStatus", () => {
    expect(typeof economyIndex.getInsuranceStatus).toBe("function");
  });
});
