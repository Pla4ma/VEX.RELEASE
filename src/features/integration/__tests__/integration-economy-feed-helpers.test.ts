/**
 * Integration tests — economy-feed-helpers.ts pure functions
 */

import { mockActiveSubscribers } from "./integration-setup";
import { isRareItem, getShopItemType } from "../economy-feed-helpers";

describe("integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe("economy-feed-helpers.ts – pure functions", () => {
    it("isRareItem returns true for legendary_ prefix", () => {
      expect(isRareItem("legendary_sword")).toBe(true);
    });

    it("isRareItem returns true for mythic_ prefix", () => {
      expect(isRareItem("mythic_shield")).toBe(true);
    });

    it("isRareItem returns true for epic_ prefix", () => {
      expect(isRareItem("epic_hat")).toBe(true);
    });

    it("isRareItem returns false for normal items", () => {
      expect(isRareItem("basic_sword")).toBe(false);
      expect(isRareItem("common_hat")).toBe(false);
      expect(isRareItem("")).toBe(false);
    });

    it("getShopItemType returns BOOST for items containing 'boost'", () => {
      expect(getShopItemType("xp_boost")).toBe("BOOST");
      expect(getShopItemType("speed_boost")).toBe("BOOST");
    });

    it("getShopItemType returns SHIELD for items containing 'shield'", () => {
      expect(getShopItemType("streak_shield")).toBe("SHIELD");
    });

    it("getShopItemType returns THEME for items containing 'theme'", () => {
      expect(getShopItemType("dark_theme")).toBe("THEME");
    });

    it("getShopItemType returns COSMETIC as default", () => {
      expect(getShopItemType("hat_blue")).toBe("COSMETIC");
      expect(getShopItemType("")).toBe("COSMETIC");
    });
  });
});
