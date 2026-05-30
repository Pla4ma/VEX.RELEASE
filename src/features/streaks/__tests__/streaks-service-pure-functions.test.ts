/**
 * Streaks Comprehensive Tests — Service Pure Functions
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from "@jest/globals";

import {
  isQualifyingSession,
  getCalendarDay,
  checkMilestone,
  getStreakMultiplier,
} from "../service";

describe("Service Pure Functions", () => {
  describe("isQualifyingSession", () => {
    it("qualifies 15min+ session with quality >= 50", () => {
      expect(isQualifyingSession(900, 50)).toBe(true);
    });

    it("rejects session under 10 minutes", () => {
      expect(isQualifyingSession(599, 100)).toBe(false);
    });

    it("rejects session under quality 50", () => {
      expect(isQualifyingSession(900, 49)).toBe(false);
    });

    it("accepts at exact thresholds", () => {
      expect(isQualifyingSession(600, 50)).toBe(true);
    });

    it("accepts long sessions with high quality", () => {
      expect(isQualifyingSession(3600, 100)).toBe(true);
    });
  });

  describe("getCalendarDay", () => {
    it("returns a string in M/D/YYYY format", () => {
      const ts = new Date("2025-01-15T12:00:00Z").getTime();
      const result = getCalendarDay(ts, "UTC");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("respects timezone", () => {
      const ts = Date.now();
      const utc = getCalendarDay(ts, "UTC");
      const tokyo = getCalendarDay(ts, "Asia/Tokyo");
      expect(typeof utc).toBe("string");
      expect(typeof tokyo).toBe("string");
    });
  });

  describe("checkMilestone", () => {
    it("returns milestone for day 3 with COINS reward", () => {
      const m = checkMilestone(3);
      expect(m).not.toBeNull();
      expect(m!.days).toBe(3);
      expect(m!.rewardType).toBe("COINS");
      expect(m!.rewardAmount).toBe(100);
    });

    it("returns milestone for day 7", () => {
      const m = checkMilestone(7);
      expect(m!.rewardType).toBe("COINS");
      expect(m!.rewardAmount).toBe(250);
    });

    it("returns GEMS for day 14", () => {
      expect(checkMilestone(14)!.rewardType).toBe("GEMS");
    });

    it("returns STREAK_SHIELD for day 30", () => {
      expect(checkMilestone(30)!.rewardType).toBe("STREAK_SHIELD");
    });

    it("returns GEMS for day 100", () => {
      expect(checkMilestone(100)!.rewardType).toBe("GEMS");
      expect(checkMilestone(100)!.rewardAmount).toBe(250);
    });

    it("returns null for non-milestone days", () => {
      expect(checkMilestone(4)).toBeNull();
      expect(checkMilestone(8)).toBeNull();
      expect(checkMilestone(0)).toBeNull();
    });

    it("includes achieved=true and achievedAt timestamp", () => {
      const m = checkMilestone(3);
      expect(m!.achieved).toBe(true);
      expect(m!.achievedAt).toBeGreaterThan(0);
    });
  });

  describe("getStreakMultiplier", () => {
    it("returns 1.0 for 0-2 days", () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(2)).toBe(1.0);
    });

    it("returns 1.25 for 3-6 days", () => {
      expect(getStreakMultiplier(3)).toBe(1.25);
      expect(getStreakMultiplier(6)).toBe(1.25);
    });

    it("returns 1.5 for 7-13 days", () => {
      expect(getStreakMultiplier(7)).toBe(1.5);
      expect(getStreakMultiplier(13)).toBe(1.5);
    });

    it("returns 1.75 for 14-29 days", () => {
      expect(getStreakMultiplier(14)).toBe(1.75);
      expect(getStreakMultiplier(29)).toBe(1.75);
    });

    it("returns 2.0 for 30+ days", () => {
      expect(getStreakMultiplier(30)).toBe(2.0);
      expect(getStreakMultiplier(100)).toBe(2.0);
    });
  });
});

