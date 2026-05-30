/**
 * Tests for home-spine tomorrow-preview-candidates.ts
 * (buildStreakMilestoneCandidate, buildBossCandidate, buildRivalCandidate)
 */

import {
  buildStreakMilestoneCandidate,
  buildBossCandidate,
  buildRivalCandidate,
} from "../tomorrow-preview-candidates";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const userId = "550e8400-e29b-41d4-a716-446655440000";

const baseInput = {
  userId,
  currentStreakDays: 5,
  streakWillContinue: true,
};

// ---------------------------------------------------------------------------
// tomorrow-preview-candidates tests
// ---------------------------------------------------------------------------
describe("home-spine: tomorrow-preview-candidates", () => {
  describe("buildStreakMilestoneCandidate", () => {
    it("returns null when streak will not continue", () => {
      const result = buildStreakMilestoneCandidate({
        ...baseInput,
        streakWillContinue: false,
      });
      expect(result).toBeNull();
    });

    it("returns null when tomorrow is not a milestone day", () => {
      // 5 + 1 = 6, not a milestone
      const result = buildStreakMilestoneCandidate({
        ...baseInput,
        currentStreakDays: 5,
      });
      expect(result).toBeNull();
    });

    it("returns a milestone candidate when tomorrow is day 7", () => {
      const result = buildStreakMilestoneCandidate({
        ...baseInput,
        currentStreakDays: 6,
      });
      expect(result).not.toBeNull();
      expect(result!.type).toBe("STREAK_MILESTONE");
      expect(result!.headline).toContain("7");
      expect(result!.priority).toBe(1);
    });

    it("returns milestone for day 30", () => {
      const result = buildStreakMilestoneCandidate({
        ...baseInput,
        currentStreakDays: 29,
      });
      expect(result).not.toBeNull();
      expect(result!.headline).toContain("30");
      expect(result!.metadata).toHaveProperty("badgeName", "Dragon");
    });
  });

  describe("buildBossCandidate", () => {
    it("returns null when no boss data", () => {
      expect(buildBossCandidate(baseInput)).toBeNull();
    });

    it("returns null when health >= 25%", () => {
      const result = buildBossCandidate({
        ...baseInput,
        bossData: { bossName: "Boss", healthPercent: 50, canDefeatTomorrow: false },
      });
      expect(result).toBeNull();
    });

    it("returns BOSS_NEAR_DEATH when health < 25%", () => {
      const result = buildBossCandidate({
        ...baseInput,
        bossData: { bossName: "Drake", healthPercent: 15, canDefeatTomorrow: true },
      });
      expect(result).not.toBeNull();
      expect(result!.type).toBe("BOSS_NEAR_DEATH");
      expect(result!.headline).toContain("Drake");
      expect(result!.priority).toBe(2);
    });

    it("uses different copy when canDefeatTomorrow is false", () => {
      const result = buildBossCandidate({
        ...baseInput,
        bossData: { bossName: "Drake", healthPercent: 10, canDefeatTomorrow: false },
      });
      expect(result!.headline).toContain("Almost Defeated");
    });
  });

  describe("buildRivalCandidate", () => {
    it("returns null when no rival data", () => {
      expect(buildRivalCandidate(baseInput)).toBeNull();
    });

    it("returns null when gapMinutes <= 0", () => {
      const result = buildRivalCandidate({
        ...baseInput,
        rivalData: { rivalName: "Alex", myMinutes: 100, theirMinutes: 80, gapMinutes: 0 },
      });
      expect(result).toBeNull();
    });

    it("returns RIVAL_GAP when there is a gap", () => {
      const result = buildRivalCandidate({
        ...baseInput,
        rivalData: { rivalName: "Alex", myMinutes: 50, theirMinutes: 80, gapMinutes: 30 },
      });
      expect(result).not.toBeNull();
      expect(result!.type).toBe("RIVAL_GAP");
      expect(result!.priority).toBe(3);
    });

    it("shows overtake headline when myMinutes + min(gap,30) exceeds theirs", () => {
      // willOvertake: myMinutes + Math.min(gapMinutes, 30) > theirMinutes
      // 70 + min(20, 30) = 90 > 80 → true
      const result = buildRivalCandidate({
        ...baseInput,
        rivalData: { rivalName: "Alex", myMinutes: 70, theirMinutes: 80, gapMinutes: 20 },
      });
      expect(result!.headline).toContain("Overtake");
    });
  });
});
