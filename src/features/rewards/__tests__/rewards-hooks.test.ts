/**
 * Tests for rewards hooks
 * Covers: useRewards, useVaultRewards
 */

import { useRewards, useVaultRewards } from "../hooks/index";
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

describe("useRewards", () => {
  it("returns empty array data", async () => {
    const { result } = renderHook(() => useRewards(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useVaultRewards", () => {
  it("is disabled when userId is null", () => {
    const { result } = renderHook(() => useVaultRewards(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  it("fetches empty array when userId provided", async () => {
    const { result } = renderHook(() => useVaultRewards("user-123"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
