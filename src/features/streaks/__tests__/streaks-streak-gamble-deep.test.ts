/**
 * Deep Streaks Tests — streak-gamble
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
  StreakGambleSchema,
  GAMBLE_CONFIGS,
  getGambleOptions,
} from "../streak-gamble";

// ============================================================================
// streak-gamble
// ============================================================================

describe("streak-gamble", () => {
  describe("StreakGambleSchema", () => {
    it("parses valid gamble", () => {
      const result = StreakGambleSchema.parse({
        id: "g1",
        userId: "u1",
        streakDaysAtRisk: 5,
        startedAt: Date.now(),
        sessionId: "s1",
        status: "ACTIVE",
        requiredGrade: "A",
        bonusXpIfWon: 500,
      });
      expect(result.status).toBe("ACTIVE");
    });

    it("rejects invalid status", () => {
      expect(() =>
        StreakGambleSchema.parse({
          id: "g1",
          userId: "u1",
          streakDaysAtRisk: 5,
          startedAt: Date.now(),
          sessionId: "s1",
          status: "INVALID",
          requiredGrade: "A",
          bonusXpIfWon: 500,
        }),
      ).toThrow();
    });
  });

  describe("GAMBLE_CONFIGS", () => {
    it("has conservative, moderate, aggressive", () => {
      expect(GAMBLE_CONFIGS.conservative).toBeDefined();
      expect(GAMBLE_CONFIGS.moderate).toBeDefined();
      expect(GAMBLE_CONFIGS.aggressive).toBeDefined();
    });

    it("conservative requires B grade", () => {
      expect(GAMBLE_CONFIGS.conservative.requiredGrade).toBe("B");
    });

    it("aggressive requires S grade", () => {
      expect(GAMBLE_CONFIGS.aggressive.requiredGrade).toBe("S");
    });
  });

  describe("getGambleOptions", () => {
    it("returns options with availability based on hours remaining", () => {
      const result = getGambleOptions(5, 3);
      expect(result.options).toHaveLength(3);
      // aggressive needs <=6h, moderate needs <=12h, conservative needs <=24h
      expect(result.available).toBe(true);
    });

    it("returns no available options when plenty of time left", () => {
      const result = getGambleOptions(5, 48);
      expect(result.available).toBe(false);
    });

    it("all options available with 1h remaining", () => {
      const result = getGambleOptions(10, 1);
      expect(result.options.every((o) => o.available)).toBe(true);
    });
  });
});
