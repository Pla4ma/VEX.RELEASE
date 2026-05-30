import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Event bus mock ────────────────────────────────────────────────────────
jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

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
jest.mock("../../streaks/StreakEvolutionSystem", () => ({
  awardInsurance: jest.fn(),
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────
import * as achievementHelpers from "../achievement-helpers";
import {
  ACHIEVEMENT_FEATURE_UNLOCKS,
} from "../feature-unlocks";
import { STUDY_ACHIEVEMENTS } from "../study-achievements";
import {
  BOSS_PHASE3_ACHIEVEMENTS,
  STREAK_EVOLUTION_ACHIEVEMENTS,
} from "../boss-streak-achievements";
import { eventBus } from "../../../events";
import { awardInsurance } from "../../streaks/StreakEvolutionSystem";
import type { Achievement } from "../types";

// ─── Typed mock accessors ──────────────────────────────────────────────────
const mockedEventBus = jest.mocked(eventBus);
const mockedAwardInsurance = jest.mocked(awardInsurance);

// ─── Helpers ────────────────────────────────────────────────────────
const makeTestAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
  id: "test-ach",
  title: "Test Achievement",
  description: "A test achievement",
  category: "SESSION",
  rarity: "COMMON",
  icon: "🌟",
  isHidden: false,
  progressMax: 1,
  unlockCondition: { type: "TEST", target: 1, comparator: "GREATER_THAN" },
  pointValue: 10,
  shareText: "I did it!",
  reward: {},
  ...overrides,
});

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
      expect(achievementHelpers.hasUnlockedFeature(["achievement-7-day-streak"], "nope")).toBe(false);
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
      [0, 3], [3, 7], [7, 14], [14, 30], [30, 100], [100, 100], [200, 100],
    ])("streak %i -> next milestone %i", (streak, expected) => {
      expect(achievementHelpers.getNextMilestoneDays(streak)).toBe(expected);
    });
  });

  describe("getAchievementPreview", () => {
    const base = makeTestAchievement();

    it("returns full info for visible achievement", () => {
      const p = achievementHelpers.getAchievementPreview(base, true);
      expect(p.title).toBe("Test Achievement");
      expect(p.category).toBe("SESSION");
    });

    it("returns mystery for hidden + locked", () => {
      const p = achievementHelpers.getAchievementPreview({ ...base, isHidden: true }, false);
      expect(p.title).toBe("???" );
      expect(p.description).toContain("mystery");
      expect(p.icon).toBe("❓");
      expect(p.category).toBe("HIDDEN");
    });

    it("returns real info for hidden but unlocked", () => {
      expect(achievementHelpers.getAchievementPreview({ ...base, isHidden: true }, true).title).toBe("Test Achievement");
    });
  });

  describe("handleAchievementUnlock", () => {
    const makeAch = (id: string): Achievement => makeTestAchievement({ id });

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
      expect(mockedAwardInsurance).toHaveBeenCalledWith("user-1", milestone, 1);
    });

    it("does not award insurance for non-streak achievement", () => {
      achievementHelpers.handleAchievementUnlock("user-1", makeAch("random-ach"));
      expect(mockedAwardInsurance).not.toHaveBeenCalled();
    });

    it("publishes achievement:unlocked event", () => {
      achievementHelpers.handleAchievementUnlock("user-1", makeAch("test-ach"));
      expect(mockedEventBus.publish).toHaveBeenCalledWith(
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
        const g = achievementHelpers.getProgressionGuide([STUDY_ACHIEVEMENTS[0]!.id, STUDY_ACHIEVEMENTS[1]!.id], []);
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

    it("returns nearbyAchievements for locked achievements", () => {
      const g = achievementHelpers.getProgressionGuide([], []);
      // When no achievements are unlocked, all are locked and nearbyAchievements
      // contains up to 5 of them (those with highest progress %)
      expect(Array.isArray(g.nearbyAchievements)).toBe(true);
    });
  });
});
