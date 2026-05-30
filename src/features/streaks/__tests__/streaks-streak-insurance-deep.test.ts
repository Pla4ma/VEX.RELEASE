/**
 * Deep Streaks Tests — streak-insurance
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));
jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));
jest.mock("../../../utils/uuid", () => ({
  v4: jest.fn(() => "mock-uuid-1234"),
}));
jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));
jest.mock("../repository", () => ({
  fetchStreak: jest.fn(),
  createStreak: jest.fn(),
  updateStreak: jest.fn(),
  recordShieldEarned: jest.fn(),
  recordShieldUsed: jest.fn(),
  getAvailableShield: jest.fn(),
}));
jest.mock("../restore-quest", () => ({
  hasUsedStreakRestoreThisMonth: jest.fn(() => Promise.resolve(false)),
}));
jest.mock("../repository-helpers", () => ({
  RepositoryError: class RepositoryError extends Error {},
}));

// ── Imports ────────────────────────────────────────────────────────────────

import {
  StreakInsuranceSchema,
  ComebackTokenSchema,
  INSURANCE_PRICING,
  calculateInsuranceCost,
  calculateInsurancePayout,
  calculateComebackTokensEarned,
  calculateTokenRestoreValue,
  canPurchaseInsurance,
  createInsurance,
} from "../streak-insurance";

describe("streak-insurance", () => {
  describe("calculateInsuranceCost", () => {
    it("returns minimum cost for low streak days", () => {
      const cost = calculateInsuranceCost(1);
      expect(cost).toBe(
        INSURANCE_PRICING.baseCost +
          INSURANCE_PRICING.minDays * INSURANCE_PRICING.perDayMultiplier,
      );
    });

    it("scales with streak days", () => {
      const cost5 = calculateInsuranceCost(5);
      const cost10 = calculateInsuranceCost(10);
      expect(cost10).toBeGreaterThan(cost5);
    });

    it("caps at maxDays", () => {
      const cost30 = calculateInsuranceCost(30);
      const cost50 = calculateInsuranceCost(50);
      expect(cost30).toBe(cost50);
    });
  });

  describe("calculateInsurancePayout", () => {
    it("restores at least 3 days", () => {
      const payout = calculateInsurancePayout(5, 1);
      expect(payout.restoredDays).toBeGreaterThanOrEqual(3);
    });

    it("increases with user level", () => {
      const low = calculateInsurancePayout(20, 1);
      const high = calculateInsurancePayout(20, 50);
      expect(high.restoredDays).toBeGreaterThanOrEqual(low.restoredDays);
    });

    it("xpBonus is 10 per restored day", () => {
      const payout = calculateInsurancePayout(10, 10);
      expect(payout.xpBonus).toBe(payout.restoredDays * 10);
    });
  });

  describe("calculateComebackTokensEarned", () => {
    it("returns at least 1 token", () => {
      expect(calculateComebackTokensEarned(5)).toBeGreaterThanOrEqual(1);
    });

    it("returns more tokens for longer broken streaks", () => {
      const short = calculateComebackTokensEarned(5);
      const long = calculateComebackTokensEarned(50);
      expect(long).toBeGreaterThanOrEqual(short);
    });

    it("scales roughly by 10 days per token", () => {
      expect(calculateComebackTokensEarned(15)).toBe(2);
      expect(calculateComebackTokensEarned(30)).toBe(3);
    });
  });

  describe("calculateTokenRestoreValue", () => {
    it("returns 5 per token", () => {
      expect(calculateTokenRestoreValue(1)).toBe(5);
      expect(calculateTokenRestoreValue(3)).toBe(15);
    });
  });

  describe("canPurchaseInsurance", () => {
    it("allows purchase when all conditions met", () => {
      const result = canPurchaseInsurance("u1", 10, 10000, false);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeNull();
    });

    it("blocks when already has active insurance", () => {
      const result = canPurchaseInsurance("u1", 10, 10000, true);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("active");
    });

    it("blocks when streak too short", () => {
      const result = canPurchaseInsurance("u1", 2, 10000, false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("minimum");
    });

    it("blocks when insufficient balance", () => {
      const result = canPurchaseInsurance("u1", 10, 0, false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("progress");
    });

    it("includes cost in result", () => {
      const result = canPurchaseInsurance("u1", 10, 10000, false);
      expect(result.cost).toBe(calculateInsuranceCost(10));
    });
  });

  describe("createInsurance", () => {
    it("creates insurance with correct fields", () => {
      const ins = createInsurance("user-1", 10, 750);
      expect(ins.userId).toBe("user-1");
      expect(ins.streakDaysProtected).toBe(10);
      expect(ins.cost).toBe(750);
      expect(ins.used).toBe(false);
      expect(ins.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe("StreakInsuranceSchema", () => {
    it("parses valid insurance", () => {
      const result = StreakInsuranceSchema.parse({
        id: "ins1",
        userId: "u1",
        streakDaysProtected: 10,
        cost: 750,
        purchasedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        used: false,
      });
      expect(result.used).toBe(false);
    });
  });

  describe("ComebackTokenSchema", () => {
    it("parses valid token", () => {
      const result = ComebackTokenSchema.parse({
        id: "tok1",
        userId: "u1",
        sourceStreak: 15,
        earnedAt: Date.now(),
        used: false,
        restoreValue: 5,
      });
      expect(result.restoreValue).toBe(5);
    });
  });
});
