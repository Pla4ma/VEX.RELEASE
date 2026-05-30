/**
 * Deep Streaks Tests — streak-risk-assessment
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
  settleGamble,
  assessStreakRisk,
  convertShieldsToInsurance,
  StreakInsuranceEvents,
} from "../streak-risk-assessment";
import { calculateInsuranceCost } from "../streak-insurance";

// ============================================================================
// streak-risk-assessment
// ============================================================================

describe("streak-risk-assessment", () => {
  describe("settleGamble", () => {
    const gamble = {
      id: "g1",
      userId: "u1",
      streakDaysAtRisk: 7,
      startedAt: Date.now(),
      sessionId: "s1",
      status: "ACTIVE" as const,
      requiredGrade: "A" as const,
      bonusXpIfWon: 500,
    };

    it("wins when grade meets requirement", () => {
      const result = settleGamble(gamble, "S", 90);
      expect(result.won).toBe(true);
      expect(result.streakSaved).toBe(true);
      expect(result.newStreakDays).toBe(7);
    });

    it("wins when grade equals requirement", () => {
      const result = settleGamble(gamble, "A", 80);
      expect(result.won).toBe(true);
    });

    it("loses when grade below requirement", () => {
      const result = settleGamble(gamble, "C", 50);
      expect(result.won).toBe(false);
      expect(result.streakSaved).toBe(false);
      expect(result.newStreakDays).toBe(1);
    });

    it("awards XP based on quality when won", () => {
      const result = settleGamble(gamble, "S", 100);
      expect(result.xpAwarded).toBe(500);
    });

    it("scales XP by quality percentage", () => {
      const result = settleGamble(gamble, "A", 50);
      expect(result.xpAwarded).toBe(250);
    });
  });

  describe("assessStreakRisk", () => {
    it("returns NONE risk when session completed today", () => {
      const assessment = assessStreakRisk(
        5,
        Date.now(),
        "UTC",
        10000,
        false,
        0,
      );
      expect(assessment.riskLevel).toBe("NONE");
    });

    it("returns elevated risk based on time of day", () => {
      const assessment = assessStreakRisk(
        5,
        null,
        "UTC",
        10000,
        false,
        0,
      );
      expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(
        assessment.riskLevel,
      );
    });

    it("includes insurance cost in result", () => {
      const assessment = assessStreakRisk(10, null, "UTC", 10000, false, 0);
      expect(assessment.insuranceCost).toBe(calculateInsuranceCost(10));
    });

    it("insurance not available when already active", () => {
      const assessment = assessStreakRisk(10, null, "UTC", 10000, true, 0);
      expect(assessment.insuranceAvailable).toBe(false);
    });
  });

  describe("convertShieldsToInsurance", () => {
    it("converts 0 shields to empty arrays", () => {
      const result = convertShieldsToInsurance(0, 10);
      expect(result.insurance).toHaveLength(0);
      expect(result.tokens).toHaveLength(0);
    });

    it("converts 1 shield to 1 insurance", () => {
      const result = convertShieldsToInsurance(1, 10);
      expect(result.insurance).toHaveLength(1);
      expect(result.tokens).toHaveLength(0);
    });

    it("converts extra shields to tokens", () => {
      const result = convertShieldsToInsurance(3, 10);
      expect(result.insurance).toHaveLength(1);
      expect(result.tokens).toHaveLength(2);
    });
  });

  describe("StreakInsuranceEvents", () => {
    it("defines all event types", () => {
      expect(StreakInsuranceEvents.INSURANCE_PURCHASED).toBeTruthy();
      expect(StreakInsuranceEvents.INSURANCE_USED).toBeTruthy();
      expect(StreakInsuranceEvents.GAMBLE_STARTED).toBeTruthy();
      expect(StreakInsuranceEvents.GAMBLE_WON).toBeTruthy();
      expect(StreakInsuranceEvents.GAMBLE_LOST).toBeTruthy();
      expect(StreakInsuranceEvents.TOKEN_EARNED).toBeTruthy();
      expect(StreakInsuranceEvents.TOKEN_USED).toBeTruthy();
    });
  });
});
