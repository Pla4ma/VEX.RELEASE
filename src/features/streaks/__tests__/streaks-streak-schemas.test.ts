/**
 * Streaks Comprehensive Tests — Schemas Core
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from "@jest/globals";

import {
  RiskLevelSchema,
  StreakSchema,
  StreakSummarySchema,
  StreakRowSchema,
  MilestoneRewardTypeSchema,
  StreakMilestoneSchema,
  type Streak,
} from "../schemas";

// ============================================================================
// Fixtures
// ============================================================================
const BASE_MOCK_STREAK: Streak = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  userId: "550e8400-e29b-41d4-a716-446655440001",
  currentDays: 5,
  longestDays: 10,
  lastQualifyingSessionAt: Date.now() - 12 * 60 * 60 * 1000,
  currentDayCompletedAt: null,
  frozenUntil: null,
  shieldsAvailable: 2,
  gracePeriodUsed: false,
  timezone: "UTC",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function mockStreak(overrides: Partial<Streak> = {}): Streak {
  return { ...BASE_MOCK_STREAK, ...overrides };
}

describe("Streak Schemas", () => {
  describe("RiskLevelSchema", () => {
    it("accepts all valid risk levels", () => {
      for (const level of ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]) {
        expect(RiskLevelSchema.safeParse(level).success).toBe(true);
      }
    });
    it("rejects invalid risk level", () => {
      expect(RiskLevelSchema.safeParse("EXTREME").success).toBe(false);
    });
  });

  describe("StreakSchema", () => {
    it("accepts valid streak object", () => {
      const result = StreakSchema.safeParse(BASE_MOCK_STREAK);
      expect(result.success).toBe(true);
    });
    it("applies defaults", () => {
      const result = StreakSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      expect(result.currentDays).toBe(0);
      expect(result.longestDays).toBe(0);
      expect(result.shieldsAvailable).toBe(0);
      expect(result.timezone).toBe("UTC");
      expect(result.gracePeriodUsed).toBe(false);
    });
    it("rejects extra fields (strict mode)", () => {
      const result = StreakSchema.safeParse({ ...BASE_MOCK_STREAK, extra: true });
      expect(result.success).toBe(false);
    });
    it("rejects negative currentDays", () => {
      const result = StreakSchema.safeParse({ ...BASE_MOCK_STREAK, currentDays: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe("StreakRowSchema", () => {
    const validRow = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      current_days: 3,
      longest_days: 10,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    it("accepts valid row", () => {
      expect(StreakRowSchema.safeParse(validRow).success).toBe(true);
    });
    it("converts string timestamps to numbers", () => {
      const row = {
        ...validRow,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };
      const result = StreakRowSchema.parse(row);
      expect(typeof result.created_at).toBe("number");
      expect(typeof result.updated_at).toBe("number");
    });
    it("passthrough allows extra fields", () => {
      const row = { ...validRow, extra_field: "value" };
      expect(StreakRowSchema.safeParse(row).success).toBe(true);
    });
  });

  describe("StreakSummarySchema", () => {
    it("accepts valid summary", () => {
      const result = StreakSummarySchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        currentDays: 5,
        longestDays: 10,
        isAtRisk: false,
        riskLevel: "NONE",
        nextDeadline: null,
        frozenUntil: null,
        shieldAvailable: true,
      });
      expect(result.success).toBe(true);
    });
    it("rejects extra fields (strict mode)", () => {
      const result = StreakSummarySchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        currentDays: 5,
        longestDays: 10,
        isAtRisk: false,
        riskLevel: "NONE",
        nextDeadline: null,
        frozenUntil: null,
        shieldAvailable: true,
        extra: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("MilestoneRewardTypeSchema", () => {
    it("accepts all valid reward types", () => {
      for (const t of ["XP", "COINS", "GEMS", "ITEM", "BADGE", "STREAK_SHIELD"]) {
        expect(MilestoneRewardTypeSchema.safeParse(t).success).toBe(true);
      }
    });
    it("rejects invalid type", () => {
      expect(MilestoneRewardTypeSchema.safeParse("DIAMONDS").success).toBe(false);
    });
  });

  describe("StreakMilestoneSchema", () => {
    it("accepts valid milestone", () => {
      const result = StreakMilestoneSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        days: 7,
        name: "Week Warrior",
        description: "7 days strong",
        rewardType: "COINS",
        rewardAmount: 250,
        rewardItemId: null,
        badgeId: "streak-7",
        achieved: true,
        achievedAt: Date.now(),
      });
      expect(result.success).toBe(true);
    });
    it("rejects days < 1", () => {
      const result = StreakMilestoneSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        days: 0,
        name: "test",
        description: "test",
        rewardType: "XP",
        rewardAmount: 0,
        rewardItemId: null,
        badgeId: null,
        achieved: false,
        achievedAt: null,
      });
      expect(result.success).toBe(false);
    });
  });
});
