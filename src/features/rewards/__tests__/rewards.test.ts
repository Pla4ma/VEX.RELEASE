/**
 * Tests for the rewards feature
 * Covers: schemas, service, hooks, components, index exports
 */

// ── Schemas ────────────────────────────────────────────────────────

import {
  RewardTypeSchema,
  RewardTriggerSchema,
} from "../schemas";

describe("RewardTypeSchema", () => {
  it("accepts XP", () => {
    expect(RewardTypeSchema.parse("XP")).toBe("XP");
  });

  it("rejects invalid reward types", () => {
    expect(() => RewardTypeSchema.parse("COINS")).toThrow();
    expect(() => RewardTypeSchema.parse("GEMS")).toThrow();
    expect(() => RewardTypeSchema.parse("")).toThrow();
  });
});

describe("RewardTriggerSchema", () => {
  it.each(["SESSION", "STREAK", "ACHIEVEMENT", "COMEBACK", "SESSION_COMPLETE", "CHALLENGE_COMPLETE"])(
    "accepts valid trigger '%s'",
    (trigger) => {
      expect(RewardTriggerSchema.parse(trigger)).toBe(trigger);
    },
  );

  it("rejects unknown triggers", () => {
    expect(() => RewardTriggerSchema.parse("INVALID")).toThrow();
    expect(() => RewardTriggerSchema.parse("")).toThrow();
  });
});

// ── Service: calculateXpReward ─────────────────────────────────────

import { calculateXpReward, createReward, claimReward } from "../service";

describe("calculateXpReward", () => {
  it("calculates base XP with default duration (25 min)", () => {
    // 50 + 25 * 1.5 = 87.5, rounded = 88, * streakMultiplier 1.0 = 88
    const xp = calculateXpReward(25, "SESSION_COMPLETE", 1.0);
    expect(xp).toBe(88);
  });

  it("calculates base XP with custom duration", () => {
    // 50 + 10 * 1.5 = 65, * 1.0 = 65
    const xp = calculateXpReward(10, "SESSION_COMPLETE", 1.0);
    expect(xp).toBe(65);
  });

  it("applies STREAK trigger multiplier (1.5x)", () => {
    // 50 + 25 * 1.5 = 87.5 -> 88, * 1.0 streak = 88, * 1.5 streak trigger = 132
    const xp = calculateXpReward(25, "STREAK", 1.0);
    expect(xp).toBe(132);
  });

  it("applies COMEBACK trigger multiplier (2.0x)", () => {
    // 50 + 25 * 1.5 = 87.5 -> 88, * 1.0 streak = 88, * 2.0 comeback = 176
    const xp = calculateXpReward(25, "COMEBACK", 1.0);
    expect(xp).toBe(176);
  });

  it("applies streak multiplier", () => {
    const baseXp = calculateXpReward(25, "SESSION_COMPLETE", 1.0);
    const boostedXp = calculateXpReward(25, "SESSION_COMPLETE", 2.0);
    // base=87.5, round(87.5*1)=88, round(87.5*2)=175 — rounding differs
    expect(baseXp).toBe(88);
    expect(boostedXp).toBe(175);
    expect(boostedXp).toBeGreaterThan(baseXp);
  });

  it("combines streak multiplier and STREAK trigger", () => {
    // 50 + 25 * 1.5 = 87.5; round(87.5 * 2.0) = 175; round(175 * 1.5) = round(262.5) = 263
    const xp = calculateXpReward(25, "STREAK", 2.0);
    expect(xp).toBe(263);
  });

  it("returns at least 10 XP (minimum floor)", () => {
    // 50 + 0 * 1.5 = 50, * 1.0 = 50 — still above 10
    // But with tiny duration and low multiplier:
    // 50 + 0 * 1.5 = 50 — that's above floor
    // Actually floor is Math.max(10, total), so just verify floor
    const xp = calculateXpReward(0, "SESSION_COMPLETE", 0.1);
    // 50 + 0 = 50, * 0.1 = 5, max(10, 5) = 10
    expect(xp).toBe(10);
  });

  it("uses default arguments when none provided", () => {
    const xp = calculateXpReward();
    expect(xp).toBe(88); // same as default 25 min
  });

  it("handles SESSION trigger (no extra multiplier)", () => {
    const xp = calculateXpReward(25, "SESSION", 1.0);
    expect(xp).toBe(88);
  });

  it("handles CHALLENGE_COMPLETE trigger (no extra multiplier)", () => {
    const xp = calculateXpReward(25, "CHALLENGE_COMPLETE", 1.0);
    expect(xp).toBe(88);
  });

  it("handles ACHIEVEMENT trigger (no extra multiplier)", () => {
    const xp = calculateXpReward(25, "ACHIEVEMENT", 1.0);
    expect(xp).toBe(88);
  });
});

// ── Service: createReward ──────────────────────────────────────────

describe("createReward", () => {
  it("returns an id containing the userId", async () => {
    const result = await createReward({
      userId: "user-123",
      type: "XP",
      amount: 100,
    });
    expect(result.id).toContain("user-123");
    expect(result.id).toMatch(/^reward_/);
  });

  it("returns an id with a timestamp suffix", async () => {
    const before = Date.now();
    const result = await createReward({
      userId: "user-456",
      type: "XP",
      amount: 50,
      trigger: "SESSION_COMPLETE",
    });
    const after = Date.now();
    // Extract timestamp from id
    const parts = result.id.split("_");
    const ts = parseInt(parts[parts.length - 1], 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("accepts all optional fields without error", async () => {
    const result = await createReward({
      userId: "user-789",
      type: "XP",
      amount: 200,
      trigger: "STREAK",
      triggerType: "streak_bonus",
      triggerId: "streak-10",
      idempotencyKey: "idem-key-1",
      metadata: { source: "test" },
    });
    expect(result.id).toBeDefined();
  });
});

// ── Service: claimReward ───────────────────────────────────────────

describe("claimReward", () => {
  it("resolves without error", async () => {
    await expect(claimReward()).resolves.toBeUndefined();
  });
});

// ── Hooks ──────────────────────────────────────────────────────────

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

// ── Component: RewardChest ─────────────────────────────────────────

import { RewardChest } from "../components/reward-chest";
import { render } from "@testing-library/react-native";

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

// ── Index exports ──────────────────────────────────────────────────

import * as rewardsIndex from "../index";

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
