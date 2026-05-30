/**
 * Tests for economy hooks and query keys
 */

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
