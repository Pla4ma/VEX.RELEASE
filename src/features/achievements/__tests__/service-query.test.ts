import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import * as service from "../stats";
import * as repository from "../repository";
import type { UserAchievement } from "../types";

jest.mock("../repository");
jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));
jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));
jest.mock("../../../shared/analytics/analytics-events", () => ({
  ProgressionEvents: { ACHIEVEMENT_UNLOCKED: "achievement_unlocked" },
}));

const mockedRepository = jest.mocked(repository);

const mockUserAchievement = (
  overrides: Partial<UserAchievement> = {},
): UserAchievement => ({
  userId: "user-1",
  achievementId: "session-first",
  progress: 0,
  maxProgress: 1,
  isUnlocked: false,
  progressHistory: [],
  ...overrides,
});

describe("getAllAchievementsWithProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRepository.getUserAchievement.mockResolvedValue(null);
  });

  it("returns all achievements with default progress of 0 when no user data", async () => {
    const result = await service.getAllAchievementsWithProgress("user-1");
    expect(result.length).toBeGreaterThan(0);
    for (const a of result) {
      expect(a.progress).toBe(0);
      expect(a.isUnlocked).toBe(false);
    }
  });

  it("merges user progress with achievement definitions", async () => {
    mockedRepository.getUserAchievement.mockImplementation(
      async (_userId, achievementId) => {
        if (achievementId === "session-first") {
          return mockUserAchievement({
            achievementId: "session-first",
            progress: 1,
            isUnlocked: true,
          });
        }
        return null;
      },
    );
    const result = await service.getAllAchievementsWithProgress("user-1");
    const sessionFirst = result.find((a) => a.id === "session-first");
    expect(sessionFirst?.progress).toBe(1);
    expect(sessionFirst?.isUnlocked).toBe(true);
  });
});

describe("getAchievementStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRepository.getUserAchievement.mockResolvedValue(null);
  });

  it("returns totals matching ALL_ACHIEVEMENTS length", async () => {
    const stats = await service.getAchievementStats("user-1");
    const { ALL_ACHIEVEMENTS } = require("../definitions");
    expect(stats.total).toBe(ALL_ACHIEVEMENTS.length);
    expect(stats.unlocked).toBe(0);
  });

  it("counts unlocked achievements correctly", async () => {
    mockedRepository.getUserAchievement.mockImplementation(
      async (_userId, achievementId) => {
        if (achievementId === "session-first") {
          return mockUserAchievement({
            achievementId: "session-first",
            isUnlocked: true,
          });
        }
        return null;
      },
    );
    const stats = await service.getAchievementStats("user-1");
    expect(stats.unlocked).toBe(1);
  });

  it("groups achievements by category", async () => {
    const stats = await service.getAchievementStats("user-1");
    expect(typeof stats.byCategory).toBe("object");
    expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0);
  });

  it("groups achievements by rarity tier", async () => {
    const stats = await service.getAchievementStats("user-1");
    expect(typeof stats.byTier).toBe("object");
    expect(Object.keys(stats.byTier).length).toBeGreaterThan(0);
  });
});

describe("getCompletionPercentage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRepository.getUserAchievement.mockResolvedValue(null);
  });

  it("returns 0 when no achievements are unlocked", async () => {
    const pct = await service.getCompletionPercentage("user-1");
    expect(pct).toBe(0);
  });

  it("returns a value between 0 and 100", async () => {
    mockedRepository.getUserAchievement.mockImplementation(
      async (_userId, achievementId) => {
        if (achievementId === "session-first") {
          return mockUserAchievement({
            achievementId: "session-first",
            isUnlocked: true,
          });
        }
        return null;
      },
    );
    const pct = await service.getCompletionPercentage("user-1");
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});
