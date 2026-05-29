/**
 * Comprehensive tests for the achievements feature.
 *
 * Covers: schemas, repository, definitions helpers, achievement-unlock,
 * achievement-helpers, event-handlers, EventHandler class, and stats.
 */
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Event bus mock ────────────────────────────────────────────────────────
const mockPublish = jest.fn();
const mockSubscribe = jest.fn(() => jest.fn());
const mockEventBus = { publish: mockPublish, subscribe: mockSubscribe };

jest.mock("../../../events", () => ({ eventBus: mockEventBus }));
jest.mock("../../../events/EventBus", () => ({ eventBus: mockEventBus }));

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

// ─── Streak insurance mock ─────────────────────────────────────────────────
const mockAwardInsurance = jest.fn();
jest.mock("../../streaks/StreakEvolutionSystem", () => ({
  awardInsurance: mockAwardInsurance,
}));

// ─── Liveops feature access mock ───────────────────────────────────────────
const mockGetAvailabilityFor = jest.fn(() => ({
  canSubscribeToEvents: true,
  isEnabled: true,
}));
jest.mock("../../liveops-config/feature-access-store", () => ({
  getAvailabilityFor: mockGetAvailabilityFor,
}));

// ─── Achievement unlock mock (for event-handlers tests) ────────────────────
const mockCheckAchievement = jest.fn(() => Promise.resolve(null));
const mockCheckCumulative = jest.fn(() => Promise.resolve(undefined));
jest.mock("../achievement-unlock", () => ({
  checkAchievement: (...args: unknown[]) => mockCheckAchievement(...args),
  checkCumulativeAchievements: (...args: unknown[]) =>
    mockCheckCumulative(...args),
}));

// ─── Repository mock (for stats, achievement-unlock, achievement-helpers) ──
const mockGetUserAchievement = jest.fn();
const mockGetAllUserAchievements = jest.fn();
const mockCreateUserAchievement = jest.fn();
const mockUpdateAchievementProgress = jest.fn();
const mockResetAllUserAchievements = jest.fn();
jest.mock("../repository", () => ({
  getUserAchievement: mockGetUserAchievement,
  getAllUserAchievements: mockGetAllUserAchievements,
  createUserAchievement: mockCreateUserAchievement,
  updateAchievementProgress: mockUpdateAchievementProgress,
  resetAllUserAchievements: mockResetAllUserAchievements,
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────
import * as repository from "../repository";
import * as statsService from "../stats";
import * as achievementHelpers from "../achievement-helpers";
import * as achievementUnlock from "../achievement-unlock";
import * as eventHandlers from "../event-handlers";
import {
  AchievementEventHandler,
  checkAchievementManually,
  getAchievementsByCategoryForUser,
} from "../EventHandler";
import {
  AchievementCategorySchema,
  AchievementRaritySchema,
  UserAchievementRowSchema,
} from "../schemas";
import {
  getAchievementById as getAchievementByIdHelper,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getVisibleAchievements,
  getAchievementDisplayInfo,
  getRarityColor,
  getRarityPoints,
  calculateTotalAchievementPoints,
  getActiveAchievements,
  isBehaviorBasedAchievement,
} from "../definitions/helpers";
import { ALL_ACHIEVEMENTS, RARITY_CONFIG } from "../definitions";
import { ACHIEVEMENT_FEATURE_UNLOCKS } from "../feature-unlocks";
import { STUDY_ACHIEVEMENTS } from "../study-achievements";
import {
  BOSS_PHASE3_ACHIEVEMENTS,
  STREAK_EVOLUTION_ACHIEVEMENTS,
} from "../boss-streak-achievements";
import { eventBus } from "../../../events";
import { getAvailabilityFor } from "../../liveops-config/feature-access-store";
import type { Achievement, UserAchievement } from "../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

const makeDbRow = (overrides: Record<string, unknown> = {}) => ({
  user_id: "user-1",
  achievement_id: "session-first",
  progress: 0,
  max_progress: 1,
  is_unlocked: false,
  unlocked_at: null,
  progress_history: [],
  ...overrides,
});

// ════════════════════════════════════════════════════════════════════════════
// 1. Schemas
// ════════════════════════════════════════════════════════════════════════════

describe("Schemas", () => {
  describe("AchievementCategorySchema", () => {
    it("accepts all valid categories", () => {
      for (const cat of [
        "SESSION", "STREAK", "BOSS", "SOCIAL", "PROGRESSION", "ECONOMY",
      ]) {
        expect(AchievementCategorySchema.parse(cat)).toBe(cat);
      }
    });

    it("rejects an invalid category", () => {
      expect(() => AchievementCategorySchema.parse("INVALID")).toThrow();
    });
  });

  describe("AchievementRaritySchema", () => {
    it("accepts all valid rarities", () => {
      for (const r of ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]) {
        expect(AchievementRaritySchema.parse(r)).toBe(r);
      }
    });

    it("rejects an invalid rarity", () => {
      expect(() => AchievementRaritySchema.parse("MYTHIC")).toThrow();
    });
  });

  describe("UserAchievementRowSchema", () => {
    it("parses a valid DB row", () => {
      const parsed = UserAchievementRowSchema.parse(makeDbRow());
      expect(parsed.user_id).toBe("user-1");
      expect(parsed.achievement_id).toBe("session-first");
      expect(parsed.progress).toBe(0);
      expect(parsed.is_unlocked).toBe(false);
    });

    it("defaults progress_history to empty array", () => {
      const row = makeDbRow();
      delete (row as Record<string, unknown>).progress_history;
      expect(UserAchievementRowSchema.parse(row).progress_history).toEqual([]);
    });

    it("accepts null unlocked_at", () => {
      expect(
        UserAchievementRowSchema.parse(makeDbRow({ unlocked_at: null })).unlocked_at,
      ).toBeNull();
    });

    it("parses progress_history entries", () => {
      const parsed = UserAchievementRowSchema.parse(
        makeDbRow({ progress_history: [{ timestamp: 1000, progress: 1, source: "session" }] }),
      );
      expect(parsed.progress_history).toHaveLength(1);
      expect(parsed.progress_history[0]?.source).toBe("session");
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. Repository (tested via mocked interface — verifies shape of exports)
// ════════════════════════════════════════════════════════════════════════════

describe("Repository exports", () => {
  it("exports getUserAchievement", () => {
    expect(typeof repository.getUserAchievement).toBe("function");
  });

  it("exports getAllUserAchievements", () => {
    expect(typeof repository.getAllUserAchievements).toBe("function");
  });

  it("exports createUserAchievement", () => {
    expect(typeof repository.createUserAchievement).toBe("function");
  });

  it("exports updateAchievementProgress", () => {
    expect(typeof repository.updateAchievementProgress).toBe("function");
  });

  it("exports resetAllUserAchievements", () => {
    expect(typeof repository.resetAllUserAchievements).toBe("function");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. Definitions Helpers
// ════════════════════════════════════════════════════════════════════════════

describe("Definitions Helpers", () => {
  const testAchs: Achievement[] = [
    {
      id: "ach-1", title: "First", description: "First ach",
      category: "SESSION", rarity: "COMMON", icon: "🌱", isHidden: false,
      progressMax: 1, unlockCondition: { type: "TEST", target: 1, comparator: "GREATER_THAN" },
      pointValue: 10, shareText: "text", reward: {},
    },
    {
      id: "ach-2", title: "Second", description: "Second ach",
      category: "BOSS", rarity: "RARE", icon: "🏆", isHidden: true,
      progressMax: 5, unlockCondition: { type: "TEST", target: 5, comparator: "CUMULATIVE" },
      pointValue: 50, shareText: "text", reward: {},
    },
    {
      id: "ach-3", title: "Third", description: "Third ach",
      category: "SESSION", rarity: "COMMON", icon: "⭐", isHidden: false, isDeprecated: true,
      progressMax: 10, unlockCondition: { type: "TEST", target: 10, comparator: "CUMULATIVE" },
      pointValue: 25, shareText: "text", reward: {},
    },
  ];

  describe("getAchievementById (helper)", () => {
    it("finds achievement by id", () => {
      expect(getAchievementByIdHelper(testAchs, "ach-1")?.title).toBe("First");
    });

    it("returns undefined for missing id", () => {
      expect(getAchievementByIdHelper(testAchs, "nope")).toBeUndefined();
    });
  });

  describe("getAchievementsByCategory", () => {
    it("filters by category", () => {
      const r = getAchievementsByCategory(testAchs, "SESSION");
      expect(r).toHaveLength(2);
      expect(r.every((a) => a.category === "SESSION")).toBe(true);
    });

    it("returns empty for no matches", () => {
      expect(getAchievementsByCategory(testAchs, "STREAK")).toHaveLength(0);
    });
  });

  describe("getAchievementsByRarity", () => {
    it("filters by rarity", () => {
      expect(getAchievementsByRarity(testAchs, "COMMON")).toHaveLength(2);
    });
  });

  describe("getVisibleAchievements", () => {
    it("excludes hidden achievements", () => {
      const v = getVisibleAchievements(testAchs);
      expect(v).toHaveLength(2);
      expect(v.every((a) => !a.isHidden)).toBe(true);
    });
  });

  describe("getAchievementDisplayInfo", () => {
    it("returns full info for visible achievement", () => {
      const info = getAchievementDisplayInfo(testAchs[0]!, false);
      expect(info.title).toBe("First");
      expect(info.icon).toBe("🌱");
    });

    it("returns mystery for hidden + locked", () => {
      const info = getAchievementDisplayInfo(testAchs[1]!, false);
      expect(info.title).toBe("???");
      expect(info.icon).toBe("❓");
    });

    it("returns full info for hidden but unlocked", () => {
      const info = getAchievementDisplayInfo(testAchs[1]!, true);
      expect(info.title).toBe("Second");
    });

    it("shows legendary hint for hidden+locked LEGENDARY", () => {
      const ach: Achievement = { ...testAchs[1]!, rarity: "LEGENDARY", isHidden: true };
      expect(getAchievementDisplayInfo(ach, false).description).toContain("rumored");
    });
  });

  describe("getRarityColor", () => {
    it("returns a color for each rarity", () => {
      for (const r of ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"] as const) {
        expect(getRarityColor(r).length).toBeGreaterThan(0);
      }
    });
  });

  describe("getRarityPoints", () => {
    it("matches RARITY_CONFIG", () => {
      expect(getRarityPoints("COMMON")).toBe(RARITY_CONFIG.COMMON.points);
      expect(getRarityPoints("LEGENDARY")).toBe(RARITY_CONFIG.LEGENDARY.points);
    });
  });

  describe("calculateTotalAchievementPoints", () => {
    it("sums point values", () => {
      expect(calculateTotalAchievementPoints(testAchs)).toBe(10 + 50 + 25);
    });

    it("returns 0 for empty array", () => {
      expect(calculateTotalAchievementPoints([])).toBe(0);
    });
  });

  describe("getActiveAchievements", () => {
    it("excludes deprecated achievements", () => {
      const active = getActiveAchievements(testAchs);
      expect(active).toHaveLength(2);
      expect(active.every((a) => !a.isDeprecated)).toBe(true);
    });
  });

  describe("isBehaviorBasedAchievement", () => {
    it("returns true for non-deprecated, non-ECONOMY", () => {
      expect(isBehaviorBasedAchievement(testAchs[0]!)).toBe(true);
    });

    it("returns false for ECONOMY", () => {
      expect(isBehaviorBasedAchievement({ ...testAchs[0]!, category: "ECONOMY" })).toBe(false);
    });

    it("returns false for deprecated", () => {
      expect(isBehaviorBasedAchievement(testAchs[2]!)).toBe(false);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. Achievement Unlock
// ════════════════════════════════════════════════════════════════════════════

describe("achievement-unlock", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribe.mockReturnValue(jest.fn());
  });

  describe("checkAchievement", () => {
    it("returns null for unknown achievement id", async () => {
      expect(await achievementUnlock.checkAchievement("user-1", "nonexistent")).toBeNull();
    });

    it("returns null if already unlocked", async () => {
      const realAch = ALL_ACHIEVEMENTS[0]!;
      mockGetUserAchievement.mockResolvedValue(
        mockUserAchievement({ achievementId: realAch.id, isUnlocked: true }),
      );
      expect(await achievementUnlock.checkAchievement("user-1", realAch.id)).toBeNull();
    });

    it("unlocks and returns result for valid locked achievement", async () => {
      const realAch = ALL_ACHIEVEMENTS[0]!;
      // checkAchievement: getUserAchievement -> null
      mockGetUserAchievement
        .mockResolvedValueOnce(null)
        // unlockAchievement: getUserAchievement -> null
        .mockResolvedValueOnce(null);
      mockCreateUserAchievement.mockResolvedValue(
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
      mockGetAllUserAchievements.mockResolvedValue([
        mockUserAchievement({
          achievementId: realAch.id,
          progress: realAch.progressMax,
          isUnlocked: false,
        }),
      ]);
      mockGetUserAchievement.mockResolvedValue(null);
      mockUpdateAchievementProgress.mockResolvedValue(
        mockUserAchievement({ achievementId: realAch.id, isUnlocked: true }),
      );
      await achievementUnlock.checkCumulativeAchievements("user-1", "TEST", [realAch.id]);
      expect(mockGetAllUserAchievements).toHaveBeenCalledWith("user-1");
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. Achievement Helpers (achievement-helpers.ts)
// ════════════════════════════════════════════════════════════════════════════

describe("achievement-helpers", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("hasUnlockedFeature", () => {
    it("returns true when user has the required achievement", () => {
      const f = ACHIEVEMENT_FEATURE_UNLOCKS[0]!;
      expect(achievementHelpers.hasUnlockedFeature([f.achievementId], f.featureId)).toBe(true);
    });

    it("returns false when user lacks required achievement", () => {
      expect(achievementHelpers.hasUnlockedFeature([], "x")).toBe(false);
    });

    it("returns false for unknown feature id", () => {
      expect(
        achievementHelpers.hasUnlockedFeature(["achievement-7-day-streak"], "nope"),
      ).toBe(false);
    });
  });

  describe("getUnlockedFeatures", () => {
    it("returns features matching unlocked achievements", () => {
      const f = ACHIEVEMENT_FEATURE_UNLOCKS[0]!;
      const r = achievementHelpers.getUnlockedFeatures([f.achievementId]);
      expect(r.length).toBeGreaterThanOrEqual(1);
      expect(r.some((uf) => uf.featureId === f.featureId)).toBe(true);
    });

    it("returns empty when no achievements match", () => {
      expect(achievementHelpers.getUnlockedFeatures(["x"])).toEqual([]);
    });
  });

  describe("getNextMilestoneDays", () => {
    it.each([
      [0, 3],
      [3, 7],
      [7, 14],
      [14, 30],
      [30, 100],
      [100, 100],
      [200, 100],
    ])("streak %i -> next milestone %i", (streak, expected) => {
      expect(achievementHelpers.getNextMilestoneDays(streak)).toBe(expected);
    });
  });

  describe("getAchievementPreview", () => {
    const base: Achievement = {
      id: "t", title: "Test Achievement", description: "A test",
      category: "SESSION", rarity: "COMMON", icon: "🌟", isHidden: false,
      progressMax: 1, unlockCondition: { type: "T", target: 1, comparator: "GREATER_THAN" },
      pointValue: 10, shareText: "text", reward: {},
    };

    it("returns full info for visible achievement", () => {
      const p = achievementHelpers.getAchievementPreview(base, true);
      expect(p.title).toBe("Test Achievement");
      expect(p.category).toBe("SESSION");
    });

    it("returns mystery for hidden + locked", () => {
      const p = achievementHelpers.getAchievementPreview({ ...base, isHidden: true }, false);
      expect(p.title).toBe("???");
      expect(p.description).toContain("mystery");
      expect(p.icon).toBe("❓");
      expect(p.category).toBe("HIDDEN");
    });

    it("returns real info for hidden but unlocked", () => {
      expect(
        achievementHelpers.getAchievementPreview({ ...base, isHidden: true }, true).title,
      ).toBe("Test Achievement");
    });
  });

  describe("handleAchievementUnlock", () => {
    const makeAch = (id: string): Achievement => ({
      id, title: "T", description: "d",
      category: "SESSION", rarity: "COMMON", icon: "⭐", isHidden: false,
      progressMax: 1, unlockCondition: { type: "T", target: 1, comparator: "GREATER_THAN" },
      pointValue: 10, shareText: "text", reward: {},
    });

    it("returns { unlocked: true, features }", () => {
      const r = achievementHelpers.handleAchievementUnlock("user-1", makeAch("generic"));
      expect(r.unlocked).toBe(true);
      expect(Array.isArray(r.features)).toBe(true);
    });

    it.each([
      ["achievement-7-day-streak", "MILESTONE_7"],
      ["achievement-30-day-streak", "MILESTONE_30"],
      ["achievement-100-day-streak", "MILESTONE_100"],
    ])("awards insurance for %s", (id, milestone) => {
      achievementHelpers.handleAchievementUnlock("user-1", makeAch(id));
      expect(mockAwardInsurance).toHaveBeenCalledWith("user-1", milestone, 1);
    });

    it("publishes achievement:unlocked event", () => {
      achievementHelpers.handleAchievementUnlock("user-1", makeAch("test-ach"));
      expect(mockPublish).toHaveBeenCalledWith(
        "achievement:unlocked",
        expect.objectContaining({ userId: "user-1", achievementId: "test-ach" }),
      );
    });
  });

  describe("getProgressionGuide", () => {
    it("returns null currentAchievement when nothing unlocked", () => {
      const g = achievementHelpers.getProgressionGuide([], []);
      expect(g.currentAchievement).toBeNull();
      expect(g.totalPoints).toBe(0);
    });

    it("sets currentAchievement to last unlocked", () => {
      if (STUDY_ACHIEVEMENTS.length >= 2) {
        const g = achievementHelpers.getProgressionGuide(
          [STUDY_ACHIEVEMENTS[0]!.id, STUDY_ACHIEVEMENTS[1]!.id], [],
        );
        expect(g.currentAchievement?.id).toBe(STUDY_ACHIEVEMENTS[1]!.id);
      }
    });

    it("calculates totalPoints from unlocked achievements", () => {
      const ach = STUDY_ACHIEVEMENTS[0]!;
      expect(achievementHelpers.getProgressionGuide([ach.id], []).totalPoints).toBe(ach.pointValue);
    });

    it("returns categoryProgress record", () => {
      expect(typeof achievementHelpers.getProgressionGuide([], []).categoryProgress).toBe("object");
    });

    it("returns nextAchievement for in-progress achievements", () => {
      const all = [...STUDY_ACHIEVEMENTS, ...BOSS_PHASE3_ACHIEVEMENTS, ...STREAK_EVOLUTION_ACHIEVEMENTS];
      if (all.length >= 1) {
        const g = achievementHelpers.getProgressionGuide([], [{ id: all[0]!.id, progress: 1 }]);
        expect(g.nextAchievement).not.toBeNull();
      }
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. Event Handlers
// ════════════════════════════════════════════════════════════════════════════

describe("event-handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckAchievement.mockResolvedValue(null);
    mockCheckCumulative.mockResolvedValue(undefined);
  });

  describe("handleSessionCompleted", () => {
    it("calls checkCumulativeAchievements for SESSION_COMPLETE", async () => {
      await eventHandlers.handleSessionCompleted({
        userId: "user-1", duration: 1800, quality: 80, timestamp: Date.now(),
      } as any);
      expect(mockCheckCumulative).toHaveBeenCalledWith(
        "user-1", "SESSION_COMPLETE", expect.arrayContaining(["session-first"]),
      );
    });

    it("checks 60-min achievement for long sessions", async () => {
      await eventHandlers.handleSessionCompleted({
        userId: "user-1", duration: 3700, timestamp: Date.now(),
      } as any);
      expect(mockCheckAchievement).toHaveBeenCalledWith("user-1", "session-60-min");
    });

    it("does not check 60-min for short sessions", async () => {
      await eventHandlers.handleSessionCompleted({
        userId: "user-1", duration: 1800, timestamp: Date.now(),
      } as any);
      expect(
        mockCheckAchievement.mock.calls.find(([, id]: [string, string]) => id === "session-60-min"),
      ).toBeUndefined();
    });
  });

  describe("handleStreakUpdated", () => {
    it("checks streak achievements based on streak days", async () => {
      await eventHandlers.handleStreakUpdated({
        userId: "user-1", state: { currentStreak: 10 },
      } as any);
      expect(mockCheckAchievement).toHaveBeenCalled();
    });

    it("checks all applicable tiers for high streaks", async () => {
      await eventHandlers.handleStreakUpdated({
        userId: "user-1", state: { currentStreak: 100 },
      } as any);
      expect(mockCheckAchievement.mock.calls.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("handleBossDefeated", () => {
    it("checks cumulative boss achievements", async () => {
      await eventHandlers.handleBossDefeated({
        userId: "user-1", bossId: "boss-1", damageDealt: 50, participants: ["user-1"],
      } as any);
      expect(mockCheckCumulative).toHaveBeenCalledWith(
        "user-1", "BOSS_DEFEAT", expect.arrayContaining(["boss-first"]),
      );
    });

    it("checks solo boss when no participants", async () => {
      await eventHandlers.handleBossDefeated({
        userId: "user-1", bossId: "boss-1", damageDealt: 50, participants: [],
      } as any);
      expect(mockCheckAchievement).toHaveBeenCalledWith("user-1", "boss-solo");
    });

    it("checks critical hit when damage > 100", async () => {
      await eventHandlers.handleBossDefeated({
        userId: "user-1", bossId: "boss-1", damageDealt: 150, participants: ["user-1"],
      } as any);
      expect(mockCheckAchievement).toHaveBeenCalledWith("user-1", "boss-critical");
    });
  });

  describe("handleLevelUp", () => {
    it("checks level achievements for high levels", async () => {
      await eventHandlers.handleLevelUp({ userId: "user-1", newLevel: 25 } as any);
      expect(
        mockCheckAchievement.mock.calls.find(([, id]: [string, string]) => id === "prog-level-5"),
      ).toBeDefined();
    });

    it("does not check for low levels", async () => {
      await eventHandlers.handleLevelUp({ userId: "user-1", newLevel: 3 } as any);
      expect(mockCheckAchievement).not.toHaveBeenCalled();
    });
  });

  describe("handlePrestige", () => {
    it("checks first prestige achievement", async () => {
      await eventHandlers.handlePrestige({ userId: "user-1" } as any);
      expect(mockCheckAchievement).toHaveBeenCalledWith("user-1", "prog-first-prestige");
    });
  });

  describe("handleStreakComeback", () => {
    it("checks phoenix achievement", async () => {
      await eventHandlers.handleStreakComeback({ userId: "user-1" } as any);
      expect(mockCheckAchievement).toHaveBeenCalledWith("user-1", "streak-phoenix");
    });
  });

  describe("handleStreakBroken", () => {
    it("does nothing (no-op handler)", async () => {
      await eventHandlers.handleStreakBroken({} as any);
      expect(mockCheckAchievement).not.toHaveBeenCalled();
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. EventHandler Class
// ════════════════════════════════════════════════════════════════════════════

describe("AchievementEventHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAvailabilityFor.mockReturnValue({
      canSubscribeToEvents: true,
      isEnabled: true,
    } as any);
    mockSubscribe.mockReturnValue(jest.fn());
  });

  it("subscribes to events on initialize", () => {
    const h = new AchievementEventHandler();
    h.initialize();
    expect(mockSubscribe).toHaveBeenCalled();
    h.destroy();
  });

  it("does not double-initialize", () => {
    const h = new AchievementEventHandler();
    h.initialize();
    const count = mockSubscribe.mock.calls.length;
    h.initialize();
    expect(mockSubscribe.mock.calls.length).toBe(count);
    h.destroy();
  });

  it("unsubscribes all on destroy", () => {
    const unsubFn = jest.fn();
    mockSubscribe.mockReturnValue(unsubFn);
    const h = new AchievementEventHandler();
    h.initialize();
    h.destroy();
    expect(unsubFn).toHaveBeenCalled();
  });

  it("skips initialization when feature not available", () => {
    mockGetAvailabilityFor.mockReturnValue({
      canSubscribeToEvents: false,
      isEnabled: false,
    } as any);
    const h = new AchievementEventHandler();
    h.initialize();
    expect(mockSubscribe).not.toHaveBeenCalled();
    h.destroy();
  });
});

describe("checkAchievementManually", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("returns false for unknown achievement", async () => {
    mockGetUserAchievement.mockResolvedValue(null);
    expect(await checkAchievementManually("user-1", "nonexistent")).toBe(false);
  });

  it("returns false when already unlocked", async () => {
    const realAch = ALL_ACHIEVEMENTS[0]!;
    mockGetUserAchievement.mockResolvedValue(
      mockUserAchievement({ achievementId: realAch.id, isUnlocked: true }),
    );
    expect(await checkAchievementManually("user-1", realAch.id)).toBe(false);
  });

  it("returns true when exists and not unlocked", async () => {
    const realAch = ALL_ACHIEVEMENTS[0]!;
    mockGetUserAchievement.mockResolvedValue(
      mockUserAchievement({ achievementId: realAch.id, isUnlocked: false }),
    );
    expect(await checkAchievementManually("user-1", realAch.id)).toBe(true);
  });
});

describe("getAchievementsByCategoryForUser", () => {
  it("returns achievements filtered by category", () => {
    const r = getAchievementsByCategoryForUser("user-1", "SESSION");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((a) => a.category === "SESSION")).toBe(true);
  });

  it("returns array for ECONOMY category", () => {
    expect(Array.isArray(getAchievementsByCategoryForUser("user-1", "ECONOMY"))).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. Stats Service
// ════════════════════════════════════════════════════════════════════════════

describe("Stats Service", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("resetUserAchievements", () => {
    it("delegates to repository.resetAllUserAchievements", async () => {
      await statsService.resetUserAchievements("user-1");
      expect(mockResetAllUserAchievements).toHaveBeenCalledWith("user-1");
    });
  });

  describe("getAchievementStats", () => {
    it("returns totals matching ALL_ACHIEVEMENTS length when no user data", async () => {
      mockGetUserAchievement.mockResolvedValue(null);
      const stats = await statsService.getAchievementStats("user-1");
      expect(stats.total).toBe(ALL_ACHIEVEMENTS.length);
      expect(stats.unlocked).toBe(0);
    });

    it("counts unlocked achievements correctly", async () => {
      const realAch = ALL_ACHIEVEMENTS[0]!;
      mockGetUserAchievement.mockImplementation(async (_uid: string, achId: string) => {
        if (achId === realAch.id) return mockUserAchievement({ achievementId: achId, isUnlocked: true });
        return null;
      });
      const stats = await statsService.getAchievementStats("user-1");
      expect(stats.unlocked).toBe(1);
    });

    it("includes hiddenUnlocked count", async () => {
      const hiddenAch = ALL_ACHIEVEMENTS.find((a) => a.isHidden);
      if (hiddenAch) {
        mockGetUserAchievement.mockImplementation(async (_uid: string, achId: string) => {
          if (achId === hiddenAch.id) return mockUserAchievement({ achievementId: achId, isUnlocked: true });
          return null;
        });
        const stats = await statsService.getAchievementStats("user-1");
        expect(stats.hiddenUnlocked).toBeGreaterThanOrEqual(1);
      }
    });

    it("byTier contains entries for rarity tiers", async () => {
      mockGetUserAchievement.mockResolvedValue(null);
      const stats = await statsService.getAchievementStats("user-1");
      expect(Object.keys(stats.byTier).length).toBeGreaterThan(0);
    });
  });

  describe("getNextAchievements", () => {
    it("sorts by percentComplete descending", async () => {
      mockGetUserAchievement.mockResolvedValue(null);
      const result = await statsService.getNextAchievements("user-1", 10);
      if (result.length >= 2) {
        expect(result[0]!.percentComplete).toBeGreaterThanOrEqual(result[1]!.percentComplete);
      }
    });

    it("excludes hidden achievements", async () => {
      mockGetUserAchievement.mockResolvedValue(null);
      const result = await statsService.getNextAchievements("user-1", 100);
      expect(result.every((a) => !a.isHidden)).toBe(true);
    });
  });

  describe("getAllAchievementsWithProgress", () => {
    it("returns achievements with default progress when no user data", async () => {
      mockGetUserAchievement.mockResolvedValue(null);
      const result = await statsService.getAllAchievementsWithProgress("user-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((a) => a.progress === 0)).toBe(true);
      expect(result.every((a) => !a.isUnlocked)).toBe(true);
    });

    it("merges user progress with achievement definitions", async () => {
      mockGetUserAchievement.mockImplementation(async (_uid: string, achId: string) => {
        if (achId === ALL_ACHIEVEMENTS[0]!.id) {
          return mockUserAchievement({ achievementId: achId, progress: 1, isUnlocked: true });
        }
        return null;
      });
      const result = await statsService.getAllAchievementsWithProgress("user-1");
      const first = result.find((a) => a.id === ALL_ACHIEVEMENTS[0]!.id);
      expect(first?.progress).toBe(1);
      expect(first?.isUnlocked).toBe(true);
    });
  });

  describe("revealHiddenAchievement", () => {
    it("returns proper info for a known achievement", () => {
      const info = statsService.revealHiddenAchievement(ALL_ACHIEVEMENTS[0]!.id);
      expect(info.name).not.toBe("???");
      expect(info.description).not.toBe("Unknown achievement");
    });

    it("returns placeholder for unknown id", () => {
      const info = statsService.revealHiddenAchievement("nonexistent");
      expect(info.name).toBe("???");
      expect(info.icon).toBe("❓");
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 9. ALL_ACHIEVEMENTS & Definitions Index
// ════════════════════════════════════════════════════════════════════════════

describe("Definitions Index", () => {
  it("ALL_ACHIEVEMENTS contains achievements from all categories", () => {
    expect(ALL_ACHIEVEMENTS.length).toBeGreaterThan(0);
    const cats = new Set(ALL_ACHIEVEMENTS.map((a) => a.category));
    expect(cats.has("SESSION")).toBe(true);
    expect(cats.has("STREAK")).toBe(true);
    expect(cats.has("BOSS")).toBe(true);
  });

  it("each achievement has required fields", () => {
    for (const a of ALL_ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.category).toBeTruthy();
      expect(a.rarity).toBeTruthy();
      expect(typeof a.progressMax).toBe("number");
      expect(a.progressMax).toBeGreaterThan(0);
      expect(a.unlockCondition).toBeDefined();
      expect(typeof a.pointValue).toBe("number");
      expect(a.shareText).toBeTruthy();
    }
  });

  it("RARITY_CONFIG has entries for all 5 rarities", () => {
    for (const r of ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]) {
      expect(RARITY_CONFIG[r as keyof typeof RARITY_CONFIG]).toBeDefined();
    }
  });

  it("STUDY_ACHIEVEMENTS is non-empty and all STUDY", () => {
    expect(STUDY_ACHIEVEMENTS.length).toBeGreaterThan(0);
    expect(STUDY_ACHIEVEMENTS.every((a) => a.category === "STUDY")).toBe(true);
  });

  it("BOSS_PHASE3_ACHIEVEMENTS is non-empty and all BOSS", () => {
    expect(BOSS_PHASE3_ACHIEVEMENTS.length).toBeGreaterThan(0);
    expect(BOSS_PHASE3_ACHIEVEMENTS.every((a) => a.category === "BOSS")).toBe(true);
  });

  it("STREAK_EVOLUTION_ACHIEVEMENTS is non-empty and all STREAK", () => {
    expect(STREAK_EVOLUTION_ACHIEVEMENTS.length).toBeGreaterThan(0);
    expect(STREAK_EVOLUTION_ACHIEVEMENTS.every((a) => a.category === "STREAK")).toBe(true);
  });

  it("ACHIEVEMENT_FEATURE_UNLOCKS has required fields", () => {
    expect(ACHIEVEMENT_FEATURE_UNLOCKS.length).toBeGreaterThan(0);
    for (const u of ACHIEVEMENT_FEATURE_UNLOCKS) {
      expect(u.achievementId).toBeTruthy();
      expect(u.featureId).toBeTruthy();
      expect(u.featureName).toBeTruthy();
    }
  });
});
