import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { useShield, detectComeback, calculateRiskLevel } from "../service";
import * as repository from "../repository";
import { mockStreak } from "./fixtures";

jest.mock("../repository");
jest.mock("../../../events", () => ({ eventBus: { publish: jest.fn() } }));

describe("Streaks Service - Protective Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useShield", () => {
    it("should use available shield", async () => {
      const streak = mockStreak({
        currentDays: 5,
        shieldsAvailable: 2,
      });
      jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
      jest.mocked(repository.getAvailableShield).mockResolvedValue("shield-1");
      const result = await useShield({ userId: "user-1", reason: "MANUAL" });
      expect(result).toBe(true);
    });
    it("should fail when no shields available", async () => {
      const streak = mockStreak({
        currentDays: 5,
        shieldsAvailable: 0,
      });
      jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
      const result = await useShield({ userId: "user-1", reason: "MANUAL" });
      expect(result).toBe(false);
    });
  });

  describe("detectComeback", () => {
    it("should detect comeback after break", async () => {
      const streak = mockStreak({
        currentDays: 1,
        longestDays: 30,
        lastQualifyingSessionAt: Date.now() - 72 * 60 * 60 * 1000,
        currentDayCompletedAt: Date.now(),
        shieldsAvailable: 0,
        gracePeriodUsed: true,
      });
      const defeatHistory = [
        { bossId: "boss-1", defeatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
      ];
      jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
      jest
        .mocked(repository.fetchBossDefeatHistory)
        .mockResolvedValue(defeatHistory);
      const result = await detectComeback("user-1");
      expect(result.isComeback).toBe(true);
      expect(result.previousStreak).toBe(30);
    });
    it("should not detect comeback for active streak", async () => {
      const streak = mockStreak({
        currentDays: 5,
        currentDayCompletedAt: Date.now(),
      });
      jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
      const result = await detectComeback("user-1");
      expect(result.isComeback).toBe(false);
    });
  });

  describe("calculateRiskLevel", () => {
    it("should return NONE for recent session", () => {
      const streak = mockStreak({
        currentDays: 5,
        lastQualifyingSessionAt: Date.now() - 12 * 60 * 60 * 1000,
      });
      expect(calculateRiskLevel(streak)).toBe("NONE");
    });
    it("should return LOW for 24 hours passed", () => {
      const streak = mockStreak({
        currentDays: 5,
        lastQualifyingSessionAt: Date.now() - 24 * 60 * 60 * 1000,
      });
      expect(calculateRiskLevel(streak)).toBe("LOW");
    });
    it("should return CRITICAL at 48 hours", () => {
      const streak = mockStreak({
        currentDays: 5,
        lastQualifyingSessionAt: Date.now() - 48 * 60 * 60 * 1000,
      });
      expect(calculateRiskLevel(streak)).toBe("CRITICAL");
    });
  });
});
