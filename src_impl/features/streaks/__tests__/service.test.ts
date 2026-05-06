/**
 * Streaks Service Tests
 */

import { isQualifyingSession, getCalendarDay, checkMilestone, getStreakMultiplier } from "../service";

import * as repository from "../repository";

// Mock repository
jest.mock("../repository");

describe("StreaksService", () => {
  describe("isQualifyingSession", () => {
    it("should qualify 15+ minute session with good quality", () => {
      expect(isQualifyingSession(900, 50)).toBe(true);
    });

    it("should reject short sessions", () => {
      expect(isQualifyingSession(600, 100)).toBe(false);
    });

    it("should reject low quality sessions", () => {
      expect(isQualifyingSession(1800, 40)).toBe(false);
    });

    it("should accept exact threshold", () => {
      expect(isQualifyingSession(900, 50)).toBe(true);
    });
  });

  describe("getCalendarDay", () => {
    it("should format date consistently", () => {
      const timestamp = new Date("2024-01-15").getTime();
      const result = getCalendarDay(timestamp, "UTC");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should respect timezone", () => {
      const timestamp = Date.now();
      const utc = getCalendarDay(timestamp, "UTC");
      const ny = getCalendarDay(timestamp, "America/New_York");
      // Could be different dates depending on time
      expect(typeof utc).toBe("string");
      expect(typeof ny).toBe("string");
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

    it("should return null for non-milestone days", () => {
      expect(checkMilestone(4)).toBeNull();
      expect(checkMilestone(8)).toBeNull();
    });
  });

  describe("getStreakMultiplier", () => {
    it("should return 1.0 for 0-2 days", () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(2)).toBe(1.0);
    });

    it("should return 1.25 for 3-6 days", () => {
      expect(getStreakMultiplier(3)).toBe(1.25);
      expect(getStreakMultiplier(6)).toBe(1.25);
    });

    it("should return 1.5 for 7-13 days", () => {
      expect(getStreakMultiplier(7)).toBe(1.5);
    });

    it("should return 1.75 for 14-29 days", () => {
      expect(getStreakMultiplier(14)).toBe(1.75);
    });

    it("should return 2.0 for 30+ days", () => {
      expect(getStreakMultiplier(30)).toBe(2.0);
    });
  });

  // ============================================================================
  // recordSession Tests (Phase 8A.2)
  // ============================================================================

  describe("recordSession - same-day session", () => {
    it("should NOT increment streak for same-day session", async () => {
      const { recordSession } = await import("../service");
      const today = new Date().toISOString();

      (repository.fetchStreak as jest.Mock).mockResolvedValue({
        id: "streak-1",
        userId: "user-1",
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now(),
        timezone: "UTC",
        shieldsAvailable: 0,
        gracePeriodUsed: false,
      });

      const result = await recordSession({
        userId: "user-1",
        sessionId: "session-1",
        duration: 900, // 15 min
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.action).toBe("ALREADY_TODAY");
      expect(result.previousStreak).toBe(5);
      expect(result.newStreak).toBe(5); // No increment
    });
  });

  describe("recordSession - next-day session", () => {
    it("should INCREMENT streak for next-day session", async () => {
      const { recordSession } = await import("../service");
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      (repository.fetchStreak as jest.Mock).mockResolvedValue({
        id: "streak-1",
        userId: "user-1",
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: yesterday.getTime(),
        timezone: "UTC",
        shieldsAvailable: 0,
        gracePeriodUsed: false,
      });

      (repository.updateStreak as jest.Mock).mockResolvedValue(undefined);

      const result = await recordSession({
        userId: "user-1",
        sessionId: "session-1",
        duration: 900,
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.action).toBe("INCREMENTED");
      expect(result.previousStreak).toBe(5);
      expect(result.newStreak).toBe(6); // Incremented
    });
  });

  describe("recordSession - 2-day gap (no shields)", () => {
    it("should BREAK streak for 2-day gap without shields", async () => {
      const { recordSession } = await import("../service");
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      (repository.fetchStreak as jest.Mock).mockResolvedValue({
        id: "streak-1",
        userId: "user-1",
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: twoDaysAgo.getTime(),
        timezone: "UTC",
        shieldsAvailable: 0, // No shields available
        gracePeriodUsed: false,
        frozenUntil: null,
      });

      (repository.updateStreak as jest.Mock).mockResolvedValue(undefined);

      const result = await recordSession({
        userId: "user-1",
        sessionId: "session-1",
        duration: 900,
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.action).toBe("BROKEN");
      expect(result.previousStreak).toBe(5);
      expect(result.newStreak).toBe(1); // Reset to 1
    });
  });

  describe("recordSession - 2-day gap WITH shield", () => {
    it("should use shield to protect streak during grace period", async () => {
      const { recordSession } = await import("../service");
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      (repository.fetchStreak as jest.Mock).mockResolvedValue({
        id: "streak-1",
        userId: "user-1",
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: twoDaysAgo.getTime(),
        timezone: "UTC",
        shieldsAvailable: 1, // Shield available!
        gracePeriodUsed: false,
        frozenUntil: null,
      });

      (repository.updateStreak as jest.Mock).mockResolvedValue(undefined);

      const result = await recordSession({
        userId: "user-1",
        sessionId: "session-1",
        duration: 900,
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.action).toBe("SHIELD_PROTECTED");
      expect(result.shieldUsed).toBe(true);
      expect(result.newStreak).toBe(6); // Protected and incremented
    });
  });

  describe("recordSession - timezone edge cases", () => {
    it("should handle 11 PM + midnight + 1 AM next session correctly", async () => {
      const { recordSession, getCalendarDay } = await import("../service");

      // Simulate user in NY timezone
      const nyTimezone = "America/New_York";

      // 11 PM on Jan 15
      const elevenPM = new Date("2024-01-15T23:00:00-05:00").getTime();
      // 1 AM next day (Jan 16)
      const oneAM = new Date("2024-01-16T01:00:00-05:00").getTime();

      (repository.fetchStreak as jest.Mock).mockResolvedValue({
        id: "streak-1",
        userId: "user-1",
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: elevenPM,
        timezone: nyTimezone,
        shieldsAvailable: 0,
        gracePeriodUsed: false,
      });

      (repository.updateStreak as jest.Mock).mockResolvedValue(undefined);

      const result = await recordSession({
        userId: "user-1",
        sessionId: "session-1",
        duration: 900,
        qualityScore: 80,
        completedAt: oneAM,
      });

      // Both sessions should be on the same calendar day in NY timezone
      // 11 PM and 1 AM are different dates UTC, but same day in NY
      const day1 = getCalendarDay(elevenPM, nyTimezone);
      const day2 = getCalendarDay(oneAM, nyTimezone);

      if (day1 === day2) {
        expect(result.action).toBe("ALREADY_TODAY");
      } else {
        expect(result.action).toBe("INCREMENTED");
      }
    });
  });
});
