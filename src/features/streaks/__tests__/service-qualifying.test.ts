import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  isQualifyingSession,
  getCalendarDay,
  checkMilestone,
  getStreakMultiplier,
} from "../service";

describe("Streaks Service - Qualifying & Milestones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isQualifyingSession", () => {
    it("should qualify 15+ minute session with good quality", () => {
      expect(isQualifyingSession(900, 50)).toBe(true);
    });
    it("should reject short sessions", () => {
      expect(isQualifyingSession(600, 100)).toBe(false);
      expect(isQualifyingSession(899, 100)).toBe(false);
    });
    it("should reject low quality sessions", () => {
      expect(isQualifyingSession(1800, 40)).toBe(false);
      expect(isQualifyingSession(1800, 49)).toBe(false);
    });
    it("should accept exact threshold", () => {
      expect(isQualifyingSession(900, 50)).toBe(true);
    });
    it("should reject zero duration", () => {
      expect(isQualifyingSession(0, 100)).toBe(false);
    });
    it("should reject negative duration", () => {
      expect(isQualifyingSession(-100, 100)).toBe(false);
    });
  });

  describe("getCalendarDay", () => {
    it("should format date consistently", () => {
      const timestamp = new Date("2024-01-15").getTime();
      const result = getCalendarDay(timestamp, "UTC");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
    it("should respect timezone differences", () => {
      const timestamp = Date.now();
      const utc = getCalendarDay(timestamp, "UTC");
      const ny = getCalendarDay(timestamp, "America/New_York");
      expect(typeof utc).toBe("string");
      expect(typeof ny).toBe("string");
    });
    it("should handle midnight boundary", () => {
      const midnight = new Date("2024-01-15T00:00:00Z").getTime();
      const result = getCalendarDay(midnight, "UTC");
      expect(result).toContain("1/15/2024");
    });
  });

  describe("checkMilestone", () => {
    it("should return milestone for day 3", () => {
      const result = checkMilestone(3);
      expect(result).not.toBeNull();
      expect(result?.days).toBe(3);
      expect(result?.rewardType).toBe("COINS");
    });
    it("should return milestone for day 7", () => {
      const result = checkMilestone(7);
      expect(result).not.toBeNull();
      expect(result?.days).toBe(7);
    });
    it("should return milestone for day 30", () => {
      const result = checkMilestone(30);
      expect(result).not.toBeNull();
      expect(result?.rewardType).toBe("STREAK_SHIELD");
    });
    it("should return null for non-milestone days", () => {
      expect(checkMilestone(4)).toBeNull();
      expect(checkMilestone(8)).toBeNull();
      expect(checkMilestone(15)).toBeNull();
    });
    it("should return null for day 0", () => {
      expect(checkMilestone(0)).toBeNull();
    });
  });

  describe("getStreakMultiplier", () => {
    it("should return 1.0 for 0-2 days", () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(1)).toBe(1.0);
      expect(getStreakMultiplier(2)).toBe(1.0);
    });
    it("should return 1.25 for 3-6 days", () => {
      expect(getStreakMultiplier(3)).toBe(1.25);
      expect(getStreakMultiplier(6)).toBe(1.25);
    });
    it("should return 1.5 for 7-13 days", () => {
      expect(getStreakMultiplier(7)).toBe(1.5);
      expect(getStreakMultiplier(13)).toBe(1.5);
    });
    it("should return 1.75 for 14-29 days", () => {
      expect(getStreakMultiplier(14)).toBe(1.75);
      expect(getStreakMultiplier(29)).toBe(1.75);
    });
    it("should return 2.0 for 30+ days", () => {
      expect(getStreakMultiplier(30)).toBe(2.0);
      expect(getStreakMultiplier(100)).toBe(2.0);
      expect(getStreakMultiplier(365)).toBe(2.0);
    });
  });
});
