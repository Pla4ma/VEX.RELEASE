/**
 * Mastery Feature — Unlock Gate Data Tests
 */

import { MASTERY_RANK_THRESHOLDS } from "../types";
import {
  isFeatureUnlocked,
  getRequiredRank,
  getPointsToUnlock,
  RANK_UNLOCKS,
} from "../components/mastery-unlock-gate-data";

describe("Unlock Gate Data", () => {
  it("isFeatureUnlocked returns true when rank meets requirement", () => {
    expect(isFeatureUnlocked("ADEPT", "DEEP_WORK")).toBe(true);
    expect(isFeatureUnlocked("EXPERT", "DEEP_WORK")).toBe(true);
    expect(isFeatureUnlocked("GRANDMASTER", "CUSTOM_CHALLENGE")).toBe(true);
  });

  it("isFeatureUnlocked returns false when rank is too low", () => {
    expect(isFeatureUnlocked("APPRENTICE", "DEEP_WORK")).toBe(false);
    expect(isFeatureUnlocked("APPRENTICE", "NIGHTMARE_MODE")).toBe(false);
    expect(isFeatureUnlocked("ADEPT", "MASTERY_DUEL")).toBe(false);
  });

  it("getRequiredRank returns correct rank for each feature", () => {
    expect(getRequiredRank("DEEP_WORK")).toBe("ADEPT");
    expect(getRequiredRank("NIGHTMARE_MODE")).toBe("EXPERT");
    expect(getRequiredRank("MASTERY_DUEL")).toBe("MASTER");
    expect(getRequiredRank("CUSTOM_CHALLENGE")).toBe("GRANDMASTER");
  });

  it("getPointsToUnlock returns 0 when already at required rank", () => {
    expect(getPointsToUnlock("DEEP_WORK", 100)).toBe(0);
  });

  it("getPointsToUnlock returns positive number when below threshold", () => {
    const needed = getPointsToUnlock("NIGHTMARE_MODE", 0);
    expect(needed).toBe(MASTERY_RANK_THRESHOLDS.EXPERT);
  });

  it("RANK_UNLOCKS defines unlocks for all 5 ranks", () => {
    expect(Object.keys(RANK_UNLOCKS)).toEqual([
      "APPRENTICE",
      "ADEPT",
      "EXPERT",
      "MASTER",
      "GRANDMASTER",
    ]);
    for (const rank of Object.keys(RANK_UNLOCKS)) {
      expect(
        RANK_UNLOCKS[rank as keyof typeof RANK_UNLOCKS].length,
      ).toBeGreaterThan(0);
    }
  });
});
