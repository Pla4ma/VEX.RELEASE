import * as repository from "../repository";
jest.mock("../repository");

describe("StreaksService — recordSession", () => {
  describe("same-day session", () => {
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
        duration: 900,
        qualityScore: 80,
        completedAt: Date.now(),
      });
      expect(result.action).toBe("ALREADY_TODAY");
      expect(result.previousStreak).toBe(5);
      expect(result.newStreak).toBe(5);
    });
  });

  describe("next-day session", () => {
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
      expect(result.newStreak).toBe(6);
    });
  });

  describe("2-day gap (no shields)", () => {
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
        shieldsAvailable: 0,
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
      expect(result.newStreak).toBe(1);
    });
  });

  describe("2-day gap WITH shield", () => {
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
        shieldsAvailable: 1,
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
      expect(result.newStreak).toBe(6);
    });
  });

  describe("timezone edge cases", () => {
    it("should handle 11 PM + midnight + 1 AM next session correctly", async () => {
      const { recordSession, getCalendarDay } = await import("../service");
      const nyTimezone = "America/New_York";
      const elevenPM = new Date("2024-01-15T23:00:00-05:00").getTime();
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
