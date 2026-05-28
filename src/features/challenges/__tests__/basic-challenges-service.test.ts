import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import * as service from "../basic-challenges-service";
import * as repository from "../repository";

jest.mock("../repository");
const mockRepository = repository as jest.Mocked<typeof repository>;
jest.mock("../../../rewards/RewardService", () => ({
  getRewardService: jest.fn(() => ({
    addXpReward: jest.fn(),
    addCoinReward: jest.fn(),
  })),
}));
jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

describe("Basic Challenges Service - Launch Scope", () => {
  const mockUserId = "user-123";
  const mockSessionId = "session-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Launch Scope Requirements", () => {
    it("should support daily challenge only", async () => {
      mockRepository.fetchUserActiveChallenges.mockResolvedValue([]);
      mockRepository.createUserChallenge.mockResolvedValue({
        id: "daily-challenge-123",
        userId: mockUserId,
        challengeId: "basic-daily-001",
        status: "ACTIVE",
        currentValue: 0,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      });
      const result = await service.getOrCreateBasicDailyChallenge(mockUserId);
      expect(result).toBeTruthy();
      expect(result?.challengeId).toBe("basic-daily-001");
      expect(result?.requiredCount).toBe(1);
      expect(mockRepository.createUserChallenge).toHaveBeenCalledWith(
        mockUserId,
        "basic-daily-001",
        expect.any(Number),
      );
    });
    it("should support weekly challenge only", async () => {
      mockRepository.fetchUserActiveChallenges.mockResolvedValue([]);
      mockRepository.createUserChallenge.mockResolvedValue({
        id: "weekly-challenge-123",
        userId: mockUserId,
        challengeId: "basic-weekly-001",
        status: "ACTIVE",
        currentValue: 0,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 604800000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      });
      const result = await service.getOrCreateBasicWeeklyChallenge(mockUserId);
      expect(result).toBeTruthy();
      expect(result?.challengeId).toBe("basic-weekly-001");
      expect(result?.requiredCount).toBe(5);
      expect(mockRepository.createUserChallenge).toHaveBeenCalledWith(
        mockUserId,
        "basic-weekly-001",
        expect.any(Number),
      );
    });
    it("should update progress from sessions", async () => {
      const mockDailyChallenge = {
        id: "daily-challenge-123",
        userId: mockUserId,
        challengeId: "basic-daily-001",
        status: "ACTIVE",
        currentValue: 0,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      };
      const mockWeeklyChallenge = {
        id: "weekly-challenge-123",
        userId: mockUserId,
        challengeId: "basic-weekly-001",
        status: "ACTIVE",
        currentValue: 2,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 604800000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      };
      mockRepository.fetchUserActiveChallenges.mockResolvedValue([
        mockDailyChallenge,
        mockWeeklyChallenge,
      ]);
      mockRepository.addChallengeProgress.mockResolvedValue(mockDailyChallenge);
      mockRepository.updateUserChallenge.mockResolvedValue(mockDailyChallenge);
      const result = await service.updateBasicChallengeProgressFromSession(
        mockUserId,
        mockSessionId,
        1800,
      );
      expect(result.dailyUpdated).toBe(true);
      expect(result.weeklyUpdated).toBe(true);
      expect(mockRepository.addChallengeProgress).toHaveBeenCalledWith(
        mockUserId,
        "basic-daily-001",
        1,
        `session:${mockSessionId}`,
      );
    });
    it("should integrate with reward ledger for completion", async () => {
      const mockDailyChallenge = {
        id: "daily-challenge-123",
        userId: mockUserId,
        challengeId: "basic-daily-001",
        status: "ACTIVE",
        currentValue: 0,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      };
      mockRepository.fetchUserActiveChallenges.mockClear();
      mockRepository.addChallengeProgress.mockClear();
      mockRepository.updateUserChallenge.mockClear();
      mockRepository.fetchUserActiveChallenges.mockResolvedValue([
        mockDailyChallenge,
      ]);
      mockRepository.addChallengeProgress.mockResolvedValue(mockDailyChallenge);
      mockRepository.updateUserChallenge.mockResolvedValue(mockDailyChallenge);
      const result = await service.updateBasicChallengeProgressFromSession(
        mockUserId,
        mockSessionId,
        1800,
      );
      expect(result.dailyUpdated).toBe(true);
      expect(mockRepository.addChallengeProgress).toHaveBeenCalledWith(
        mockUserId,
        "basic-daily-001",
        1,
        `session:${mockSessionId}`,
      );
    });
    it("should provide one clear CTA per challenge", async () => {
      const mockDailyChallenge = {
        id: "daily-challenge-123",
        userId: mockUserId,
        challengeId: "basic-daily-001",
        status: "ACTIVE",
        currentValue: 0,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      };
      const mockWeeklyChallenge = {
        id: "weekly-challenge-123",
        userId: mockUserId,
        challengeId: "basic-weekly-001",
        status: "ACTIVE",
        currentValue: 3,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 604800000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      };
      mockRepository.fetchUserActiveChallenges.mockResolvedValue([
        mockDailyChallenge,
        mockWeeklyChallenge,
      ]);
      const status = await service.getBasicChallengesStatus(mockUserId);
      expect(status.daily.required).toBe(1);
      expect(status.weekly.required).toBe(5);
      expect(status.daily.hasActiveChallenge).toBe(true);
      expect(status.weekly.hasActiveChallenge).toBe(true);
      expect(status.daily.progress).toBe(0);
      expect(status.weekly.progress).toBe(3);
    });
  });
});
