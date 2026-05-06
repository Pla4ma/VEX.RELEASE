/**
 * Daily Login Hook Tests
 *
 * Tests for useDailyLoginReward hook including:
 * - Query state management
 * - Claim mutation
 * - Event emission
 * - Error handling
 *
 * @phase 1
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock dependencies
vi.mock("../repository-daily", () => ({
  fetchDailyRewardsState: vi.fn(),
  saveDailyRewardClaim: vi.fn(),
}));

vi.mock("../../../events", () => ({
  eventBus: {
    emit: vi.fn(),
  },
}));

vi.mock("../analytics", () => ({
  trackDailyLoginClaimed: vi.fn(),
}));

import { fetchDailyRewardsState, saveDailyRewardClaim } from "../repository-daily";
import { eventBus } from "../../../events";
import { trackDailyLoginClaimed } from "../analytics";
import { useDailyLoginReward } from "../hooks";

describe("useDailyLoginReward", () => {
  const mockUserId = "user-123";
  const mockDailyState = {
    user_id: mockUserId,
    current_streak: 3,
    last_claimed_at: Date.now() - 86400000, // Yesterday
    last_claimed_day: 3,
    has_claimed_today: false,
    can_claim_today: true,
    next_reset_at: Date.now() + 86400000,
  };

  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe("Query", () => {
    it("should return null when userId is undefined", async () => {
      const { result } = renderHook(() => useDailyLoginReward(undefined), { wrapper });

      await waitFor(() => {
        expect(result.current.canClaim).toBe(false);
        expect(result.current.reward).toBeNull();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should fetch daily reward state when userId is provided", async () => {
      (fetchDailyRewardsState as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockDailyState,
        error: null,
      });

      const { result } = renderHook(() => useDailyLoginReward(mockUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canClaim).toBe(true);
      expect(result.current.dayNumber).toBe(4);
      expect(result.current.reward).toEqual({
        dayNumber: 4,
        type: "COINS",
        amount: 300,
        label: "300 Coins",
        icon: "🪙",
      });
    });

    it("should handle error state", async () => {
      const mockError = new Error("Failed to fetch");
      (fetchDailyRewardsState as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useDailyLoginReward(mockUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeDefined();
      });
    });

    it("should show claimed state when user has already claimed today", async () => {
      (fetchDailyRewardsState as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          ...mockDailyState,
          has_claimed_today: true,
          can_claim_today: false,
        },
        error: null,
      });

      const { result } = renderHook(() => useDailyLoginReward(mockUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canClaim).toBe(false);
      expect(result.current.reward).toBeNull();
    });
  });

  describe("Claim Mutation", () => {
    beforeEach(() => {
      (fetchDailyRewardsState as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockDailyState,
        error: null,
      });
    });

    it("should successfully claim daily reward", async () => {
      (saveDailyRewardClaim as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useDailyLoginReward(mockUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.claim();

      expect(saveDailyRewardClaim).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          day: 4,
          tier: "DAY_4",
          items: [{ type: "COINS", amount: 300 }],
        }),
      );

      expect(trackDailyLoginClaimed).toHaveBeenCalledWith(mockUserId, 4, "COINS", 300, 4);

      expect(eventBus.emit).toHaveBeenCalledWith("rewards:daily_login_claimed", {
        userId: mockUserId,
        dayNumber: 4,
        reward: { type: "COINS", amount: 300 },
        timestamp: expect.any(Number),
      });
    });

    it("should handle claim errors", async () => {
      const mockError = new Error("Claim failed");
      (saveDailyRewardClaim as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: mockError,
      });

      const { result } = renderHook(() => useDailyLoginReward(mockUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.claim()).rejects.toThrow("Claim failed");
    });

    it("should invalidate query after successful claim", async () => {
      (saveDailyRewardClaim as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: null,
      });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDailyLoginReward(mockUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.claim();

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["daily-login", "user", mockUserId],
      });
    });
  });

  describe("Reward Day Progression", () => {
    it("should return day 1 reward for new user", async () => {
      (fetchDailyRewardsState as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          ...mockDailyState,
          last_claimed_day: 0,
          current_streak: 0,
        },
        error: null,
      });

      const { result } = renderHook(() => useDailyLoginReward(mockUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.dayNumber).toBe(1);
      expect(result.current.reward?.label).toBe("100 Coins");
    });

    it("should return day 7 reward for completed week", async () => {
      (fetchDailyRewardsState as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          ...mockDailyState,
          last_claimed_day: 6,
          current_streak: 6,
        },
        error: null,
      });

      const { result } = renderHook(() => useDailyLoginReward(mockUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.dayNumber).toBe(7);
      expect(result.current.reward?.label).toBe("Premium Chest");
    });
  });
});
