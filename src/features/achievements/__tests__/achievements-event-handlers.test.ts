import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Event bus mock ────────────────────────────────────────────────────────
jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

// ─── Analytics mock ────────────────────────────────────────────────────────
jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));
jest.mock("../../../shared/analytics/analytics-events", () => ({
  ProgressionEvents: { ACHIEVEMENT_UNLOCKED: "achievement_unlocked" },
}));

// ─── Sentry mock ───────────────────────────────────────────────────────────
jest.mock("@sentry/react-native", () => ({ addBreadcrumb: jest.fn() }));

// ─── Debug mock ────────────────────────────────────────────────────────────
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// ─── Achievement unlock mock (auto-mock) ───────────────────────────────────
jest.mock("../achievement-unlock");

// ─── Repository mock (auto-mock) ───────────────────────────────────────────
jest.mock("../repository");

// ─── Imports (after mocks) ──────────────────────────────────────────────────
import * as achievementUnlock from "../achievement-unlock";
import * as eventHandlers from "../event-handlers";
import Sentry from "@sentry/react-native";

// ─── Typed mock accessors ──────────────────────────────────────────────────
const mockedAchievementUnlock = jest.mocked(achievementUnlock);

describe("event-handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior: return null/undefined
    mockedAchievementUnlock.checkAchievement.mockResolvedValue(null);
    mockedAchievementUnlock.checkCumulativeAchievements.mockResolvedValue(undefined);
  });

  describe("handleSessionCompleted", () => {
    it("calls checkCumulativeAchievements for SESSION_COMPLETE", async () => {
      await eventHandlers.handleSessionCompleted({ userId: "user-1", duration: 1800, quality: 80, timestamp: Date.now() } as any);
      expect(mockedAchievementUnlock.checkCumulativeAchievements).toHaveBeenCalledWith("user-1", "SESSION_COMPLETE", expect.arrayContaining(["session-first"]));
    });

    it("checks 60-min achievement for long sessions", async () => {
      await eventHandlers.handleSessionCompleted({ userId: "user-1", duration: 3700, timestamp: Date.now() } as any);
      expect(mockedAchievementUnlock.checkAchievement).toHaveBeenCalledWith("user-1", "session-60-min");
    });

    it("does not check 60-min for short sessions", async () => {
      await eventHandlers.handleSessionCompleted({ userId: "user-1", duration: 1800, timestamp: Date.now() } as any);
      expect(mockedAchievementUnlock.checkAchievement.mock.calls.find(([, id]: [string, string]) => id === "session-60-min")).toBeUndefined();
    });

    it("checks perfect session for quality >= 95", async () => {
      await eventHandlers.handleSessionCompleted({ userId: "user-1", duration: 1800, quality: 98, timestamp: Date.now() } as any);
      expect(mockedAchievementUnlock.checkCumulativeAchievements).toHaveBeenCalledWith("user-1", "PERFECT_SESSION", expect.arrayContaining(["session-first-s-grade"]));
    });

    it("does not check perfect session for quality < 95", async () => {
      await eventHandlers.handleSessionCompleted({ userId: "user-1", duration: 1800, quality: 80, timestamp: Date.now() } as any);
      expect(mockedAchievementUnlock.checkCumulativeAchievements.mock.calls.find(([, type]: [string, string]) => type === "PERFECT_SESSION")).toBeUndefined();
    });
  });

  describe("handleStreakUpdated", () => {
    it("checks streak achievements based on streak days", async () => {
      await eventHandlers.handleStreakUpdated({ userId: "user-1", state: { currentStreak: 10 } } as any);
      expect(mockedAchievementUnlock.checkAchievement).toHaveBeenCalled();
    });

    it("checks all applicable tiers for high streaks", async () => {
      await eventHandlers.handleStreakUpdated({ userId: "user-1", state: { currentStreak: 100 } } as any);
      expect(mockedAchievementUnlock.checkAchievement.mock.calls.length).toBeGreaterThanOrEqual(5);
    });

    it("does not check streak-365 for streak < 365", async () => {
      await eventHandlers.handleStreakUpdated({ userId: "user-1", state: { currentStreak: 50 } } as any);
      expect(mockedAchievementUnlock.checkAchievement.mock.calls.find(([, id]: [string, string]) => id === "streak-365")).toBeUndefined();
    });
  });

  describe("handleStreakMilestone", () => {
    it("adds Sentry breadcrumb for milestone", async () => {
      await eventHandlers.handleStreakMilestone({ userId: "user-1", milestone: 7 } as any);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({ category: "achievements", message: expect.stringContaining("7") }));
    });
  });

  describe("handleBossDefeated", () => {
    it("checks cumulative boss achievements", async () => {
      await eventHandlers.handleBossDefeated({ userId: "user-1", bossId: "boss-1", damageDealt: 50, participants: ["user-1"] } as any);
      expect(mockedAchievementUnlock.checkCumulativeAchievements).toHaveBeenCalledWith("user-1", "BOSS_DEFEAT", expect.arrayContaining(["boss-first"]));
    });

    it("checks solo boss when no participants", async () => {
      await eventHandlers.handleBossDefeated({ userId: "user-1", bossId: "boss-1", damageDealt: 50, participants: [] } as any);
      expect(mockedAchievementUnlock.checkAchievement).toHaveBeenCalledWith("user-1", "boss-solo");
    });

    it("checks squad boss when participants exist", async () => {
      await eventHandlers.handleBossDefeated({ userId: "user-1", bossId: "boss-1", damageDealt: 50, participants: ["user-1", "user-2"] } as any);
      expect(mockedAchievementUnlock.checkAchievement).toHaveBeenCalledWith("user-1", "boss-squad");
    });

    it("checks critical hit when damage > 100", async () => {
      await eventHandlers.handleBossDefeated({ userId: "user-1", bossId: "boss-1", damageDealt: 150, participants: ["user-1"] } as any);
      expect(mockedAchievementUnlock.checkAchievement).toHaveBeenCalledWith("user-1", "boss-critical");
    });

    it("does not check critical hit when damage <= 100", async () => {
      await eventHandlers.handleBossDefeated({ userId: "user-1", bossId: "boss-1", damageDealt: 50, participants: ["user-1"] } as any);
      expect(mockedAchievementUnlock.checkAchievement.mock.calls.find(([, id]: [string, string]) => id === "boss-critical")).toBeUndefined();
    });
  });

  describe("handleLevelUp", () => {
    it("checks level achievements for high levels", async () => {
      await eventHandlers.handleLevelUp({ userId: "user-1", newLevel: 25 } as any);
      expect(mockedAchievementUnlock.checkAchievement.mock.calls.find(([, id]: [string, string]) => id === "prog-level-5")).toBeDefined();
    });

    it("does not check for low levels", async () => {
      await eventHandlers.handleLevelUp({ userId: "user-1", newLevel: 3 } as any);
      expect(mockedAchievementUnlock.checkAchievement).not.toHaveBeenCalled();
    });
  });

  describe("handlePrestige", () => {
    it("checks first prestige achievement", async () => {
      await eventHandlers.handlePrestige({ userId: "user-1" } as any);
      expect(mockedAchievementUnlock.checkAchievement).toHaveBeenCalledWith("user-1", "prog-first-prestige");
    });
  });

  describe("handleStreakComeback", () => {
    it("checks phoenix achievement", async () => {
      await eventHandlers.handleStreakComeback({ userId: "user-1" } as any);
      expect(mockedAchievementUnlock.checkAchievement).toHaveBeenCalledWith("user-1", "streak-phoenix");
    });
  });

  describe("handleStreakBroken", () => {
    it("does nothing (no-op handler)", async () => {
      await eventHandlers.handleStreakBroken({} as any);
      expect(mockedAchievementUnlock.checkAchievement).not.toHaveBeenCalled();
    });
  });

  describe("handleAchievementCheck", () => {
    it("adds breadcrumb for manual check", async () => {
      await eventHandlers.handleAchievementCheck({ userId: "user-1", type: "manual" } as any);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({ category: "achievements", message: expect.stringContaining("Manual") }));
    });
  });
});
