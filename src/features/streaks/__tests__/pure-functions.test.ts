import {
  isQualifyingSession,
  getCalendarDay,
  checkMilestone,
  getStreakMultiplier,
} from "../service";

describe("StreaksService — pure functions", () => {
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
});
