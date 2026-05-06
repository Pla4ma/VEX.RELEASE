/**
 * Session Stakes System Tests
 * Tests for difficulty selection, XP multipliers, and gem wagering
 */

import { describe, it, expect } from "@jest/globals";
import { getStakesForDifficulty, canSelectDifficulty, getRecommendedDifficulty, calculateStakesResult, DIFFICULTY_CONFIG } from "../session-stakes";
import type { SessionDifficulty, StakesSessionResult } from "../session-stakes";

describe("Session Stakes System", () => {
  // ============================================================================
  // Difficulty Selection
  // ============================================================================
  describe("Difficulty Selection", () => {
    it("should return correct stakes for CASUAL difficulty", () => {
      const stakes = getStakesForDifficulty("CASUAL");

      expect(stakes.difficulty).toBe("CASUAL");
      expect(stakes.xpMultiplier).toBe(0.5);
      expect(stakes.maxPauses).toBe(999); // Infinity mapped to large number
      expect(stakes.strictMode).toBe(false);
      expect(stakes.gemWager).toBe(0);
    });

    it("should return correct stakes for FOCUSED difficulty", () => {
      const stakes = getStakesForDifficulty("FOCUSED");

      expect(stakes.difficulty).toBe("FOCUSED");
      expect(stakes.xpMultiplier).toBe(1.0);
      expect(stakes.maxPauses).toBe(2);
      expect(stakes.strictMode).toBe(false);
      expect(stakes.gemWager).toBe(0);
    });

    it("should return correct stakes for DEEP_WORK difficulty", () => {
      const stakes = getStakesForDifficulty("DEEP_WORK");

      expect(stakes.difficulty).toBe("DEEP_WORK");
      expect(stakes.xpMultiplier).toBe(1.5);
      expect(stakes.maxPauses).toBe(0);
      expect(stakes.strictMode).toBe(true);
      expect(stakes.gemWager).toBe(5);
      expect(stakes.failureConsequence).toBe("LOSE_WAGER");
    });
  });

  // ============================================================================
  // Difficulty Unlock Requirements
  // ============================================================================
  describe("Difficulty Unlock Requirements", () => {
    it("should allow all users to select CASUAL", () => {
      expect(canSelectDifficulty(1, "CASUAL")).toEqual({ allowed: true });
      expect(canSelectDifficulty(10, "CASUAL")).toEqual({ allowed: true });
    });

    it("should allow all users to select FOCUSED", () => {
      expect(canSelectDifficulty(1, "FOCUSED")).toEqual({ allowed: true });
      expect(canSelectDifficulty(5, "FOCUSED")).toEqual({ allowed: true });
    });

    it("should lock DEEP_WORK until level 3", () => {
      expect(canSelectDifficulty(1, "DEEP_WORK")).toEqual({
        allowed: false,
        reason: "Deep Work unlocks at level 3",
      });
      expect(canSelectDifficulty(2, "DEEP_WORK")).toEqual({
        allowed: false,
        reason: "Deep Work unlocks at level 3",
      });
    });

    it("should allow DEEP_WORK at level 3+", () => {
      expect(canSelectDifficulty(3, "DEEP_WORK")).toEqual({ allowed: true });
      expect(canSelectDifficulty(10, "DEEP_WORK")).toEqual({ allowed: true });
    });
  });

  // ============================================================================
  // Recommended Difficulty
  // ============================================================================
  describe("Recommended Difficulty Algorithm", () => {
    it("should recommend CASUAL for new users (level < 2)", () => {
      expect(getRecommendedDifficulty(1, 0.9, 0)).toBe("CASUAL");
    });

    it("should recommend CASUAL for struggling users (completion < 60%)", () => {
      expect(getRecommendedDifficulty(5, 0.5, 10)).toBe("CASUAL");
    });

    it("should recommend FOCUSED as default for normal users", () => {
      expect(getRecommendedDifficulty(3, 0.7, 3)).toBe("FOCUSED");
    });

    it("should recommend DEEP_WORK for high performers (streak 7+, completion 85%+)", () => {
      expect(getRecommendedDifficulty(5, 0.9, 7)).toBe("DEEP_WORK");
    });
  });

  // ============================================================================
  // Stakes Result Calculation
  // ============================================================================
  describe("Stakes Result Calculation", () => {
    it("should calculate CASUAL session correctly", () => {
      const result = calculateStakesResult("session-1", "user-1", "CASUAL", true, 100, 0, 30 * 60, 0);

      expect(result.completed).toBe(true);
      expect(result.xpEarned).toBe(50); // 100 * 0.5
      expect(result.gemWager).toBe(0);
      expect(result.gemsLost).toBe(0);
    });

    it("should calculate FOCUSED session correctly", () => {
      const result = calculateStakesResult("session-1", "user-1", "FOCUSED", true, 100, 1, 30 * 60, 0);

      expect(result.xpEarned).toBe(100); // 100 * 1.0
      expect(result.qualityScore).toBe(75); // 100 - (1 * 25)
    });

    it("should calculate DEEP_WORK completion with bonus gems", () => {
      const result = calculateStakesResult(
        "session-1",
        "user-1",
        "DEEP_WORK",
        true,
        100,
        0,
        45 * 60, // 45 minutes
        0,
      );

      expect(result.xpEarned).toBe(150); // 100 * 1.5
      expect(result.gemWager).toBe(5);
      expect(result.gemsWon).toBeGreaterThan(5); // Base 5 + time bonus
      expect(result.winStreakUpdated).toBe(1);
    });

    it("should penalize DEEP_WORK abandonment with lost gems", () => {
      const result = calculateStakesResult(
        "session-1",
        "user-1",
        "DEEP_WORK",
        false, // Abandoned
        100,
        0,
        30 * 60,
        0,
      );

      expect(result.completed).toBe(false);
      expect(result.gemsLost).toBe(5); // Lose the wager
      expect(result.winStreakUpdated).toBe(0); // Reset win streak
    });

    it("should increment win streak on consecutive DEEP_WORK completions", () => {
      const result = calculateStakesResult(
        "session-1",
        "user-1",
        "DEEP_WORK",
        true,
        100,
        0,
        30 * 60,
        5, // Previous win streak
      );

      expect(result.winStreakUpdated).toBe(6);
    });

    it("should cap gems won from DEEP_WORK based on duration", () => {
      // Very long session
      const result = calculateStakesResult(
        "session-1",
        "user-1",
        "DEEP_WORK",
        true,
        100,
        0,
        120 * 60, // 2 hours
        0,
      );

      // Max bonus is 3 gems for 90+ minutes
      expect(result.gemsWon).toBeLessThanOrEqual(8); // 5 base + 3 max
    });
  });

  // ============================================================================
  // Quality Score Calculation
  // ============================================================================
  describe("Quality Score Based on Pauses", () => {
    it("should give 100 quality with no pauses", () => {
      const result = calculateStakesResult("session-1", "user-1", "FOCUSED", true, 100, 0, 30 * 60, 0);

      expect(result.qualityScore).toBe(100);
    });

    it("should penalize pauses according to difficulty", () => {
      // CASUAL: 10% per pause
      const casualResult = calculateStakesResult("session-1", "user-1", "CASUAL", true, 100, 2, 30 * 60, 0);
      expect(casualResult.qualityScore).toBe(80); // 100 - (2 * 10)

      // FOCUSED: 25% per pause
      const focusedResult = calculateStakesResult("session-1", "user-1", "FOCUSED", true, 100, 2, 30 * 60, 0);
      expect(focusedResult.qualityScore).toBe(50); // 100 - (2 * 25)
    });

    it("should cap quality penalty at 50%", () => {
      const result = calculateStakesResult(
        "session-1",
        "user-1",
        "FOCUSED",
        true,
        100,
        10, // Many pauses
        30 * 60,
        0,
      );

      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // Difficulty Display
  // ============================================================================
  describe("UI Display Helpers", () => {
    it("should return correct display for CASUAL", () => {
      const { label, description, icon, color, riskLevel } = require("../session-stakes").getDifficultyDisplay("CASUAL");

      expect(label).toBe("Casual");
      expect(icon).toBe("🌱");
      expect(color).toBe("#4CAF50");
      expect(riskLevel).toBe("LOW");
    });

    it("should return correct display for FOCUSED", () => {
      const { label, description, icon, color, riskLevel } = require("../session-stakes").getDifficultyDisplay("FOCUSED");

      expect(label).toBe("Focused");
      expect(icon).toBe("🔥");
      expect(color).toBe("#FF9800");
      expect(riskLevel).toBe("MEDIUM");
    });

    it("should return correct display for DEEP_WORK", () => {
      const { label, description, icon, color, riskLevel } = require("../session-stakes").getDifficultyDisplay("DEEP_WORK");

      expect(label).toBe("Deep Work");
      expect(icon).toBe("⚡");
      expect(color).toBe("#9C27B0");
      expect(riskLevel).toBe("HIGH");
    });
  });
});
