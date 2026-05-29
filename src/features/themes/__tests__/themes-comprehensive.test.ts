import {
  getOwnedSessionThemeIds,
  getSelectableThemes,
  canPurchaseTheme,
  purchaseTheme,
} from "../service";
import {
  getSessionThemeById,
  SESSION_THEMES,
  SessionThemeSchema,
} from "../session-themes";

describe("themes — comprehensive", () => {
  describe("SESSION_THEMES", () => {
    it("contains at least one free theme", () => {
      const freeThemes = SESSION_THEMES.filter((t) => t.isFree);
      expect(freeThemes.length).toBeGreaterThanOrEqual(1);
    });

    it("default theme is free", () => {
      const defaultTheme = SESSION_THEMES.find((t) => t.id === "default");
      expect(defaultTheme).toBeDefined();
      expect(defaultTheme!.isFree).toBe(true);
      expect(defaultTheme!.coinCost).toBe(0);
    });

    it("all themes pass schema validation", () => {
      for (const theme of SESSION_THEMES) {
        expect(() => SessionThemeSchema.parse(theme)).not.toThrow();
      }
    });

    it("includes legendary theme with 5000 coin cost", () => {
      const legendary = SESSION_THEMES.find((t) => t.id === "legendary");
      expect(legendary).toBeDefined();
      expect(legendary!.coinCost).toBe(5000);
      expect(legendary!.isFree).toBe(false);
    });
  });

  describe("getSessionThemeById", () => {
    it("returns default theme when id is undefined", () => {
      const theme = getSessionThemeById(undefined);
      expect(theme.id).toBe("default");
    });

    it("returns default theme when id is empty string", () => {
      const theme = getSessionThemeById("");
      expect(theme.id).toBe("default");
    });

    it("returns correct theme by id", () => {
      const theme = getSessionThemeById("deep-ocean");
      expect(theme.id).toBe("deep-ocean");
      expect(theme.name).toBe("Deep Ocean");
    });

    it("returns default theme for unknown id", () => {
      const theme = getSessionThemeById("non-existent");
      expect(theme.id).toBe("default");
    });

    it("returns all themes by their ids", () => {
      for (const expected of SESSION_THEMES) {
        const theme = getSessionThemeById(expected.id);
        expect(theme.id).toBe(expected.id);
      }
    });
  });

  describe("getOwnedSessionThemeIds", () => {
    it("returns only free theme ids", async () => {
      const owned = await getOwnedSessionThemeIds("any-user");
      const freeIds = SESSION_THEMES.filter((t) => t.isFree).map((t) => t.id);
      expect(owned).toEqual(freeIds);
    });
  });

  describe("getSelectableThemes", () => {
    it("returns all themes with isOwned flag", async () => {
      const themes = await getSelectableThemes("user-1", null);
      expect(themes).toHaveLength(SESSION_THEMES.length);
      for (const theme of themes) {
        expect(theme).toHaveProperty("isOwned");
      }
    });

    it("marks free themes as owned", async () => {
      const themes = await getSelectableThemes("user-2", null);
      const freeThemes = themes.filter((t) => t.isFree);
      for (const theme of freeThemes) {
        expect(theme.isOwned).toBe(true);
      }
    });

    it("shows lock message for legendary when streak < 30", async () => {
      const themes = await getSelectableThemes("user-3", { longestDays: 10 });
      const legendary = themes.find((t) => t.id === "legendary");
      expect(legendary!.description).toContain("30 day streak");
    });

    it("does not show lock-gate message for legendary when streak >= 30", async () => {
      const themes = await getSelectableThemes("user-4", { longestDays: 30 });
      const legendary = themes.find((t) => t.id === "legendary");
      expect(legendary!.description).not.toContain("Reach a 30 day streak record to unlock purchase");
    });

    it("handles null streak", async () => {
      const themes = await getSelectableThemes("user-5", null);
      expect(themes).toHaveLength(SESSION_THEMES.length);
    });
  });

  describe("canPurchaseTheme", () => {
    it("allows free themes", () => {
      const result = canPurchaseTheme("default", null);
      expect(result.allowed).toBe(true);
      expect(result.message).toBeNull();
    });

    it("blocks legendary when streak < 30", () => {
      const result = canPurchaseTheme("legendary", { longestDays: 10 });
      expect(result.allowed).toBe(false);
      expect(result.message).toContain("30 day streak");
    });

    it("allows legendary when streak >= 30", () => {
      const result = canPurchaseTheme("legendary", { longestDays: 30 });
      expect(result.allowed).toBe(true);
      expect(result.message).toBeNull();
    });

    it("allows non-free non-legendary themes", () => {
      const result = canPurchaseTheme("deep-ocean", null);
      expect(result.allowed).toBe(true);
      expect(result.message).toBeNull();
    });

    it("blocks legendary with null streak", () => {
      const result = canPurchaseTheme("legendary", null);
      expect(result.allowed).toBe(false);
    });
  });

  describe("purchaseTheme", () => {
    it("succeeds for free themes", async () => {
      const result = await purchaseTheme("user-1", "default", null);
      expect(result.success).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it("fails for non-free themes (not available in this release)", async () => {
      const result = await purchaseTheme("user-2", "deep-ocean", null);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe(
        "Theme purchases are not available in this release.",
      );
    });

    it("fails for legendary with insufficient streak", async () => {
      const result = await purchaseTheme("user-3", "legendary", {
        longestDays: 5,
      });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain("30 day streak");
    });
  });
});
