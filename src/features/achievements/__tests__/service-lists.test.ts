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

describe("getRecentlyUnlockedAchievements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an empty array when no achievements are unlocked", async () => {
    mockedRepository.getAllUserAchievements.mockResolvedValue([]);
    const result = await service.getRecentlyUnlockedAchievements("user-1");
    expect(result).toEqual([]);
  });

  it("returns unlocked achievements sorted by most recent", async () => {
    const now = Date.now();
    mockedRepository.getAllUserAchievements.mockResolvedValue([
      mockUserAchievement({
        achievementId: "session-first",
        isUnlocked: true,
        unlockedAt: now - 1000,
      }),
      mockUserAchievement({
        achievementId: "session-10",
        isUnlocked: true,
        unlockedAt: now,
      }),
    ]);
    const result = await service.getRecentlyUnlockedAchievements("user-1", 2);
    expect(result.length).toBe(2);
    expect(result[0]?.id).toBe("session-10");
  });

  it("respects the limit parameter", async () => {
    const now = Date.now();
    mockedRepository.getAllUserAchievements.mockResolvedValue([
      mockUserAchievement({
        achievementId: "session-first",
        isUnlocked: true,
        unlockedAt: now,
      }),
      mockUserAchievement({
        achievementId: "session-10",
        isUnlocked: true,
        unlockedAt: now - 1000,
      }),
      mockUserAchievement({
        achievementId: "session-50",
        isUnlocked: true,
        unlockedAt: now - 2000,
      }),
    ]);
    const result = await service.getRecentlyUnlockedAchievements("user-1", 2);
    expect(result.length).toBe(2);
  });
});

describe("getNextAchievements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRepository.getUserAchievement.mockResolvedValue(null);
  });

  it("returns achievements with progress and percentComplete", async () => {
    const result = await service.getNextAchievements("user-1", 3);
    expect(result.length).toBeGreaterThan(0);
    for (const a of result) {
      expect(typeof a.percentComplete).toBe("number");
      expect(typeof a.remaining).toBe("number");
    }
  });

  it("does not include already-unlocked achievements", async () => {
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
    const result = await service.getNextAchievements("user-1", 50);
    const sessionFirst = result.find((a) => a.id === "session-first");
    expect(sessionFirst).toBeUndefined();
  });

  it("respects the limit parameter", async () => {
    const result = await service.getNextAchievements("user-1", 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

describe("revealHiddenAchievement", () => {
  it("returns proper info for a known achievement", () => {
    const info = service.revealHiddenAchievement("session-first");
    expect(info.name).not.toBe("???");
    expect(info.description).not.toBe("Unknown achievement");
    expect(info.icon).not.toBe("❓");
  });

  it("returns placeholder for unknown achievement id", () => {
    const info = service.revealHiddenAchievement("nonexistent-id");
    expect(info.name).toBe("???");
    expect(info.description).toBe("Unknown achievement");
    expect(info.icon).toBe("❓");
  });
});

describe("initializeUserAchievements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRepository.createUserAchievement.mockResolvedValue(null);
  });

  it("creates achievement records for each achievement", async () => {
    const { ALL_ACHIEVEMENTS } = require("../definitions");
    await service.initializeUserAchievements("user-1");
    expect(mockedRepository.createUserAchievement).toHaveBeenCalledTimes(
      ALL_ACHIEVEMENTS.length,
    );
  });

  it("initializes achievements with progress 0 and unlocked false", async () => {
    await service.initializeUserAchievements("user-1");
    const firstCall = (mockedRepository.createUserAchievement as jest.Mock)
      .mock.calls[0];
    expect(firstCall?.[2]).toMatchObject({ progress: 0, isUnlocked: false });
  });
});
