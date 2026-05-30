import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Debug mock ────────────────────────────────────────────────────────────
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// ─── Repository mock (auto-mock) ───────────────────────────────────────────
jest.mock("../repository");

// ─── Imports (after mocks) ──────────────────────────────────────────────────
import * as repository from "../repository";
import {
  checkAchievementManually,
} from "../EventHandler";
import { ALL_ACHIEVEMENTS } from "../definitions";
import type { UserAchievement } from "../types";

// ─── Typed mock accessors ──────────────────────────────────────────────────
const mockedRepository = jest.mocked(repository);

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

describe("checkAchievementManually", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("returns false for unknown achievement", async () => {
    mockedRepository.getUserAchievement.mockResolvedValue(null);
    expect(await checkAchievementManually("user-1", "nonexistent")).toBe(false);
  });

  it("returns false when already unlocked", async () => {
    const realAch = ALL_ACHIEVEMENTS[0]!;
    mockedRepository.getUserAchievement.mockResolvedValue(mockUserAchievement({ achievementId: realAch.id, isUnlocked: true }));
    expect(await checkAchievementManually("user-1", realAch.id)).toBe(false);
  });

  it("returns true when exists and not unlocked", async () => {
    const realAch = ALL_ACHIEVEMENTS[0]!;
    mockedRepository.getUserAchievement.mockResolvedValue(mockUserAchievement({ achievementId: realAch.id, isUnlocked: false }));
    expect(await checkAchievementManually("user-1", realAch.id)).toBe(true);
  });
});
