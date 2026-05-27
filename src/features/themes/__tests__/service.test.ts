import {
  getAvailableThemes,
  getUserThemes,
  unlockTheme,
  purchaseTheme,
  equipTheme,
  isThemeUnlocked,
  getThemePrice,
} from "../service";
import { getEconomyService } from "../../../economy/EconomyService";
import { getDefaultStorageAdapter } from "../../../persistence/MMKVStorageAdapter";
jest.mock("../../../economy/EconomyService");
jest.mock("../../../persistence/MMKVStorageAdapter");
const mockStorage = { getItem: jest.fn(), setItem: jest.fn() };
(getDefaultStorageAdapter as jest.Mock).mockReturnValue(mockStorage);
const TEST_USER_ID = "test-user-123";
describe("Themes Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
  });
  describe("getAvailableThemes", () => {
    it("should return all available themes", async () => {
      const themes = await getAvailableThemes();
      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        type: expect.any(String),
        colors: expect.any(Object),
        price: expect.any(Number),
        requirements: expect.any(Array),
      });
    });
    it("should include default themes", async () => {
      const themes = await getAvailableThemes();
      const defaultTheme = themes.find((t) => t.id === "default_light");
      expect(defaultTheme).toBeDefined();
      expect(defaultTheme?.price).toBe(0);
    });
    it("should include premium themes", async () => {
      const themes = await getAvailableThemes();
      const premiumThemes = themes.filter((t) => t.price > 0);
      expect(premiumThemes.length).toBeGreaterThan(0);
    });
  });
  describe("getUserThemes", () => {
    it("should return default unlocked themes for new user", async () => {
      const themes = await getUserThemes(TEST_USER_ID);
      expect(themes.unlocked).toContain("default_light");
      expect(themes.unlocked).toContain("default_dark");
      expect(themes.equipped).toBe("default_light");
    });
    it("should return stored themes for existing user", async () => {
      const storedThemes = {
        unlocked: [
          "default_light",
          "default_dark",
          "ocean_blue",
          "forest_green",
        ],
        equipped: "ocean_blue",
        purchasedAt: { ocean_blue: Date.now(), forest_green: Date.now() },
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      const themes = await getUserThemes(TEST_USER_ID);
      expect(themes.unlocked).toContain("ocean_blue");
      expect(themes.unlocked).toContain("forest_green");
      expect(themes.equipped).toBe("ocean_blue");
    });
  });
  describe("isThemeUnlocked", () => {
    it("should return true for default themes", async () => {
      const isUnlocked = await isThemeUnlocked(TEST_USER_ID, "default_light");
      expect(isUnlocked).toBe(true);
    });
    it("should return true for purchased themes", async () => {
      const storedThemes = {
        unlocked: ["default_light", "premium_theme_1"],
        equipped: "default_light",
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      const isUnlocked = await isThemeUnlocked(TEST_USER_ID, "premium_theme_1");
      expect(isUnlocked).toBe(true);
    });
    it("should return false for locked themes", async () => {
      const storedThemes = {
        unlocked: ["default_light"],
        equipped: "default_light",
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      const isUnlocked = await isThemeUnlocked(
        TEST_USER_ID,
        "locked_premium_theme",
      );
      expect(isUnlocked).toBe(false);
    });
  });
  describe("getThemePrice", () => {
    it("should return 0 for default themes", async () => {
      const price = await getThemePrice("default_light");
      expect(price).toBe(0);
    });
    it("should return correct price for premium themes", async () => {
      const price = await getThemePrice("premium_ocean");
      expect(price).toBeGreaterThan(0);
    });
    it("should throw error for non-existent theme", async () => {
      await expect(getThemePrice("non_existent_theme")).rejects.toThrow(
        "Theme not found",
      );
    });
  });
  describe("purchaseTheme", () => {
    it("should purchase theme and deduct coins", async () => {
      const mockSpendCurrency = jest.fn().mockResolvedValue(true);
      (getEconomyService as jest.Mock).mockReturnValue({
        spendCurrency: mockSpendCurrency,
      });
      const result = await purchaseTheme(TEST_USER_ID, "premium_ocean");
      expect(result.success).toBe(true);
      expect(result.themeId).toBe("premium_ocean");
      expect(mockSpendCurrency).toHaveBeenCalledWith(
        TEST_USER_ID,
        "COINS",
        expect.any(Number),
        "theme_purchase",
      );
      expect(mockStorage.setItem).toHaveBeenCalled();
    });
    it("should throw error for already unlocked theme", async () => {
      const storedThemes = {
        unlocked: ["default_light", "premium_ocean"],
        equipped: "default_light",
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      await expect(
        purchaseTheme(TEST_USER_ID, "premium_ocean"),
      ).rejects.toThrow("Theme already unlocked");
    });
    it("should throw error for non-existent theme", async () => {
      await expect(purchaseTheme(TEST_USER_ID, "non_existent")).rejects.toThrow(
        "Theme not found",
      );
    });
    it("should throw error on insufficient funds", async () => {
      const mockSpendCurrency = jest
        .fn()
        .mockRejectedValue(new Error("Insufficient funds"));
      (getEconomyService as jest.Mock).mockReturnValue({
        spendCurrency: mockSpendCurrency,
      });
      await expect(
        purchaseTheme(TEST_USER_ID, "premium_ocean"),
      ).rejects.toThrow("Insufficient funds");
    });
  });
  describe("unlockTheme", () => {
    it("should unlock theme via achievement", async () => {
      const result = await unlockTheme(TEST_USER_ID, "achievement_theme", {
        type: "achievement",
        achievementId: "seven_day_streak",
      });
      expect(result.success).toBe(true);
      expect(result.unlockedVia).toBe("achievement");
      expect(mockStorage.setItem).toHaveBeenCalled();
    });
    it("should unlock theme via mastery rank", async () => {
      const result = await unlockTheme(TEST_USER_ID, "master_theme", {
        type: "mastery",
        rank: "MASTER",
      });
      expect(result.success).toBe(true);
      expect(result.unlockedVia).toBe("mastery");
    });
    it("should unlock theme via season pass", async () => {
      const result = await unlockTheme(TEST_USER_ID, "season_exclusive", {
        type: "season",
        seasonId: "season_1",
        tier: 20,
      });
      expect(result.success).toBe(true);
      expect(result.unlockedVia).toBe("season");
    });
    it("should throw error for already unlocked theme", async () => {
      const storedThemes = {
        unlocked: ["default_light", "achievement_theme"],
        equipped: "default_light",
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      await expect(
        unlockTheme(TEST_USER_ID, "achievement_theme", {
          type: "achievement",
          achievementId: "test",
        }),
      ).rejects.toThrow("Theme already unlocked");
    });
  });
  describe("equipTheme", () => {
    it("should equip unlocked theme", async () => {
      const storedThemes = {
        unlocked: ["default_light", "ocean_blue"],
        equipped: "default_light",
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      const result = await equipTheme(TEST_USER_ID, "ocean_blue");
      expect(result.success).toBe(true);
      expect(result.equippedTheme).toBe("ocean_blue");
      expect(mockStorage.setItem).toHaveBeenCalled();
    });
    it("should throw error for locked theme", async () => {
      const storedThemes = {
        unlocked: ["default_light"],
        equipped: "default_light",
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      await expect(equipTheme(TEST_USER_ID, "locked_theme")).rejects.toThrow(
        "Theme not unlocked",
      );
    });
    it("should throw error for non-existent theme", async () => {
      await expect(equipTheme(TEST_USER_ID, "non_existent")).rejects.toThrow(
        "Theme not found",
      );
    });
  });
});
