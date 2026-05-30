/**
 * Streaks Comprehensive Tests — Gamble
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from "@jest/globals";

import {
  StreakGambleSchema,
  GAMBLE_CONFIGS,
  getGambleOptions,
} from "../streak-gamble";

describe("Streak Gamble", () => {
  describe("GAMBLE_CONFIGS", () => {
    it("has 3 configs", () => {
      expect(Object.keys(GAMBLE_CONFIGS)).toHaveLength(3);
    });

    it("conservative is LOW risk", () => {
      expect(GAMBLE_CONFIGS.conservative!.riskLevel).toBe("LOW");
      expect(GAMBLE_CONFIGS.conservative!.requiredGrade).toBe("B");
    });

    it("moderate is MEDIUM risk", () => {
      expect(GAMBLE_CONFIGS.moderate!.riskLevel).toBe("MEDIUM");
    });

    it("aggressive is HIGH risk", () => {
      expect(GAMBLE_CONFIGS.aggressive!.riskLevel).toBe("HIGH");
      expect(GAMBLE_CONFIGS.aggressive!.requiredGrade).toBe("S");
    });
  });

  describe("getGambleOptions", () => {
    it("returns available options when hours remaining is low", () => {
      const result = getGambleOptions(10, 2);
      expect(result.available).toBe(true);
      expect(result.options.filter((o) => o.available).length).toBeGreaterThan(0);
    });

    it("returns no available options when hours remaining is high", () => {
      const result = getGambleOptions(10, 48);
      expect(result.available).toBe(false);
    });

    it("conservative requires less time remaining", () => {
      const result = getGambleOptions(10, 20);
      const conservative = result.options.find((o) => o.type === "conservative");
      expect(conservative!.available).toBe(true);
      const aggressive = result.options.find((o) => o.type === "aggressive");
      expect(aggressive!.available).toBe(false);
    });
  });

  describe("StreakGambleSchema", () => {
    it("accepts valid gamble", () => {
      const result = StreakGambleSchema.safeParse({
        id: "gamble-1",
        userId: "user-1",
        streakDaysAtRisk: 10,
        startedAt: Date.now(),
        sessionId: "session-1",
        status: "ACTIVE",
        requiredGrade: "A",
        bonusXpIfWon: 500,
      });
      expect(result.success).toBe(true);
    });
  });
});

