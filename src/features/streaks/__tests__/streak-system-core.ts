import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  recordSession,
  isQualifyingSession,
  checkMilestone,
  useShield,
} from "../service";
import { mockRepository, mockStreak } from "./streak-system-helpers";

describe("Streak System - Core Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("24-Hour Window (Critical Fix)", () => {
    it("should BREAK streak after 24 hours without qualifying session", async () => {
      const lastSession = Date.now() - 25 * 60 * 60 * 1000;
      const streak = mockStreak({
        currentDays: 5,
        lastQualifyingSessionAt: lastSession,
      });
      mockRepository.fetchStreak.mockResolvedValue(streak);
      mockRepository.updateStreak.mockResolvedValue({
        ...streak,
        currentDays: 0,
      });
      const result = await recordSession({
        userId: "user-1",
        sessionId: "session-1",
        completedAt: Date.now(),
        duration: 600,
        qualityScore: 80,
      });
      expect(result.action).toBe("BROKEN");
      expect(result.newStreak).toBe(1);
    });

    it("should MAINTAIN streak within 24 hours", async () => {
      const lastSession = Date.now() - 20 * 60 * 60 * 1000;
      const streak = mockStreak({
        currentDays: 5,
        lastQualifyingSessionAt: lastSession,
      });
      mockRepository.fetchStreak.mockResolvedValue(streak);
      mockRepository.updateStreak.mockResolvedValue({
        ...streak,
        currentDays: 6,
      });
      const result = await recordSession({
        userId: "user-1",
        sessionId: "session-1",
        completedAt: Date.now(),
        duration: 600,
        qualityScore: 80,
      });
      expect(result.action).toBe("INCREMENTED");
      expect(result.newStreak).toBe(6);
    });
  });

  describe("Qualifying Session (10 min minimum)", () => {
    it("should NOT qualify sessions under 10 minutes", () => {
      expect(isQualifyingSession(9 * 60, 100)).toBe(false);
      expect(isQualifyingSession(5 * 60, 100)).toBe(false);
    });

    it("should qualify sessions at exactly 10 minutes", () => {
      expect(isQualifyingSession(10 * 60, 80)).toBe(true);
    });

    it("should NOT qualify sessions under quality 50", () => {
      expect(isQualifyingSession(15 * 60, 40)).toBe(false);
    });
  });

  describe("Streak Milestones", () => {
    it("should trigger milestone at day 3", () => {
      const milestone = checkMilestone(3);
      expect(milestone).not.toBeNull();
      expect(milestone?.days).toBe(3);
      expect(milestone?.rewardType).toBe("COINS");
    });

    it("should trigger milestone at day 7", () => {
      const milestone = checkMilestone(7);
      expect(milestone).not.toBeNull();
      expect(milestone?.rewardType).toBe("COINS");
    });

    it("should trigger streak shield at day 30", () => {
      const milestone = checkMilestone(30);
      expect(milestone).not.toBeNull();
      expect(milestone?.rewardType).toBe("STREAK_SHIELD");
    });

    it("should NOT trigger milestone at non-milestone days", () => {
      expect(checkMilestone(4)).toBeNull();
      expect(checkMilestone(8)).toBeNull();
    });
  });

  describe("Shield Mechanics", () => {
    it("should consume shield when used to protect streak", async () => {
      const streak = mockStreak({
        currentDays: 5,
        shieldsAvailable: 1,
        lastQualifyingSessionAt: Date.now() - 26 * 60 * 60 * 1000,
      });
      mockRepository.fetchStreak.mockResolvedValue(streak);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockRepository.getAvailableShield as any).mockResolvedValue("shield-1");
      mockRepository.updateStreak.mockResolvedValue({
        ...streak,
        currentDays: 6,
        shieldsAvailable: 0,
        gracePeriodUsed: true,
      });
      const result = await recordSession({
        userId: "user-1",
        sessionId: "session-1",
        completedAt: Date.now(),
        duration: 600,
        qualityScore: 80,
      });
      expect(result.action).toBe("SHIELD_PROTECTED");
      expect(result.shieldUsed).toBe(true);
    });

    it("should fail to use shield when none available", async () => {
      mockRepository.fetchStreak.mockResolvedValue(
        mockStreak({ shieldsAvailable: 0 }),
      );
      const result = await useShield({ userId: "user-1", reason: "MANUAL" });
      expect(result).toBe(false);
    });
  });
});
