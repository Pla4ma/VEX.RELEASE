/**
 * Tests for the rewards feature — hooks, components, index exports
 */

import { useRewards, useVaultRewards } from "../hooks/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { RewardChest } from "../components/reward-chest";
import { render } from "@testing-library/react-native";
import * as rewardsIndex from "../index";

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

describe("RewardChest", () => {
  it("renders the archived message", () => {
    const { getByText } = render(React.createElement(RewardChest));
    expect(
      getByText(/Chest and economy rewards have been moved/i),
    ).toBeTruthy();
  });

  it("has accessibility label", () => {
    const { getByLabelText } = render(React.createElement(RewardChest));
    expect(getByLabelText("Reward chest")).toBeTruthy();
  });
});

describe("rewards index exports", () => {
  it("exports RewardTypeSchema", () => {
    expect(rewardsIndex.RewardTypeSchema).toBeDefined();
  });

  it("exports RewardTriggerSchema", () => {
    expect(rewardsIndex.RewardTriggerSchema).toBeDefined();
  });

  it("exports calculateXpReward", () => {
    expect(typeof rewardsIndex.calculateXpReward).toBe("function");
  });

  it("exports createReward", () => {
    expect(typeof rewardsIndex.createReward).toBe("function");
  });

  it("exports claimReward", () => {
    expect(typeof rewardsIndex.claimReward).toBe("function");
  });
});
