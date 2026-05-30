import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Event bus mock ────────────────────────────────────────────────────────
jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../events/EventBus", () => ({
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
import * as repository from "../repository";
import * as achievementUnlock from "../achievement-unlock";
import { ALL_ACHIEVEMENTS } from "../definitions";
import type { UserAchievement } from "../types";

// ─── Typed mock accessors ──────────────────────────────────────────────────
const mockedRepository = jest.mocked(repository);
const mockedAchievementUnlock = jest.mocked(achievementUnlock);

// ─── Helpers ────────────────────────────────────────────────────────
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

describe("achievement-unlock", () => {
  // Use the real implementation for this section
  const realUnlock = jest.requireActual<typeof achievementUnlock>("../achievement-unlock");

  beforeEach(() => {
    jest.clearAllMocks();
    // Wire up the mock to call through to the real implementation
    mockedAchievementUnlock.checkAchievement.mockImplementation(
      (userId, achId) => realUnlock.checkAchievement(userId, achId),
    );
    mockedAchievementUnlock.checkCumulativeAchievements.mockImplementation(
      (userId, counterType, ids) => realUnlock.checkCumulativeAchievements(userId, counterType, ids),
    );
  });

  describe("checkAchievement", () => {
    it("returns null for unknown achievement id", async () => {
      expect(await achievementUnlock.checkAchievement("user-1", "nonexistent")).toBeNull();
    });

    it("returns null if already unlocked", async () => {
      const realAch = ALL_ACHIEVEMENTS[0]!;
      mockedRepository.getUserAchievement.mockResolvedValue(
        mockUserAchievement({ achievementId: realAch.id, isUnlocked: true }),
      );
      expect(await achievementUnlock.checkAchievement("user-1", realAch.id)).toBeNull();
    });

    it("unlocks and returns result for valid locked achievement", async () => {
      const realAch = ALL_ACHIEVEMENTS[0]!;
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      mockedRepository.createUserAchievement.mockResolvedValue(
        mockUserAchievement({ achievementId: realAch.id, isUnlocked: true }),
      );
      const result = await achievementUnlock.checkAchievement("user-1", realAch.id);
      expect(result).not.toBeNull();
      expect(result?.achievementId).toBe(realAch.id);
      expect(result?.userId).toBe("user-1");
      expect(result?.wasAlreadyUnlocked).toBe(false);
    });
  });

  describe("checkCumulativeAchievements", () => {
    it("checks multiple achievement ids against user progress", async () => {
      const realAch = ALL_ACHIEVEMENTS[0]!;
      mockedRepository.getAllUserAchievements.mockResolvedValue([
        mockUserAchievement({ achievementId: realAch.id, progress: realAch.progressMax, isUnlocked: false }),
      ]);
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      mockedRepository.createUserAchievement.mockResolvedValue(
        mockUserAchievement({ achievementId: realAch.id, isUnlocked: true }),
      );
      await achievementUnlock.checkCumulativeAchievements("user-1", "TEST", [realAch.id]);
      expect(mockedRepository.getAllUserAchievements).toHaveBeenCalledWith("user-1");
    });

    it("skips unknown achievement ids", async () => {
      mockedRepository.getAllUserAchievements.mockResolvedValue([]);
      await achievementUnlock.checkCumulativeAchievements("user-1", "TEST", ["nonexistent-id"]);
      expect(mockedRepository.getUserAchievement).not.toHaveBeenCalled();
    });
  });
});
