import { describe, it, expect } from "@jest/globals";
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
import { RARITY_CONFIG } from "../definitions";
import type { Achievement } from "../types";

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

describe("Definitions Helpers", () => {
  const testAchs: Achievement[] = [
    makeTestAchievement({ id: "ach-1", title: "First", category: "SESSION", rarity: "COMMON", isHidden: false, pointValue: 10 }),
    makeTestAchievement({ id: "ach-2", title: "Second", category: "BOSS", rarity: "RARE", isHidden: true, pointValue: 50, progressMax: 5, unlockCondition: { type: "TEST", target: 5, comparator: "CUMULATIVE" } }),
    makeTestAchievement({ id: "ach-3", title: "Third", category: "SESSION", rarity: "COMMON", isHidden: false, isDeprecated: true, pointValue: 25, progressMax: 10, unlockCondition: { type: "TEST", target: 10, comparator: "CUMULATIVE" } }),
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

    it("returns empty for unmatched rarity", () => {
      expect(getAchievementsByRarity(testAchs, "LEGENDARY")).toHaveLength(0);
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
      expect(info.icon).toBe("🌟");
    });

    it("returns mystery for hidden + locked", () => {
      const info = getAchievementDisplayInfo(testAchs[1]!, false);
      expect(info.title).toBe("???" );
      expect(info.icon).toBe("❓");
    });

    it("returns full info for hidden but unlocked", () => {
      const info = getAchievementDisplayInfo(testAchs[1]!, true);
      expect(info.title).toBe("Second");
    });

    it("shows legendary hint for hidden+locked LEGENDARY", () => {
      const ach = makeTestAchievement({ rarity: "LEGENDARY", isHidden: true });
      expect(getAchievementDisplayInfo(ach, false).description).toContain("rumored");
    });

    it("shows mystery hint for hidden+locked non-LEGENDARY", () => {
      const ach = makeTestAchievement({ rarity: "COMMON", isHidden: true });
      expect(getAchievementDisplayInfo(ach, false).description).toContain("mystery");
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

    it("increases with rarity tier", () => {
      expect(getRarityPoints("COMMON")).toBeLessThan(getRarityPoints("UNCOMMON"));
      expect(getRarityPoints("UNCOMMON")).toBeLessThan(getRarityPoints("RARE"));
      expect(getRarityPoints("RARE")).toBeLessThan(getRarityPoints("EPIC"));
      expect(getRarityPoints("EPIC")).toBeLessThan(getRarityPoints("LEGENDARY"));
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
