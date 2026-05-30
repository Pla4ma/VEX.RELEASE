import { describe, it, expect } from "@jest/globals";
import {
  AchievementCategorySchema,
  AchievementRaritySchema,
  UserAchievementRowSchema,
} from "../schemas";

// ─── Helpers ────────────────────────────────────────────────────────
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

describe("Schemas", () => {
  describe("AchievementCategorySchema", () => {
    it("accepts all valid categories", () => {
      for (const cat of ["SESSION", "STREAK", "BOSS", "SOCIAL", "PROGRESSION", "ECONOMY"]) {
        expect(AchievementCategorySchema.parse(cat)).toBe(cat);
      }
    });

    it("rejects an invalid category", () => {
      expect(() => AchievementCategorySchema.parse("INVALID")).toThrow();
    });

    it("rejects lowercase category", () => {
      expect(() => AchievementCategorySchema.parse("session")).toThrow();
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
      expect(UserAchievementRowSchema.parse(makeDbRow({ unlocked_at: null })).unlocked_at).toBeNull();
    });

    it("accepts string unlocked_at", () => {
      const parsed = UserAchievementRowSchema.parse(makeDbRow({ unlocked_at: "2024-01-01T00:00:00Z" }));
      expect(parsed.unlocked_at).toBe("2024-01-01T00:00:00Z");
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
