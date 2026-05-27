import {
  calculateUpgradeDiscount,
  formatTierPrice,
  getFeatureComparison,
  getPaywallTiming,
  trackLadderInteraction,
} from "./value-ladder.helpers";

describe("Value Ladder Service", () => {
  describe("getPaywallTiming", () => {
    it("does not show if recently shown", () => {
      const timing = getPaywallTiming(10, 1, 90);
      expect(timing.shouldShow).toBe(false);
      expect(timing.trigger).toBe("none");
    });

    it("shows after quality session with value proof (40+ sessions)", () => {
      const timing = getPaywallTiming(40, 10, 90);
      expect(timing.shouldShow).toBe(true);
      expect(timing.trigger).toBe("post_session");
      expect(timing.delayMinutes).toBe(2);
    });

    it("does not show before 40 sessions even with high quality", () => {
      const timing = getPaywallTiming(35, 10, 95);
      expect(timing.shouldShow).toBe(false);
    });

    it("does not show with low quality", () => {
      const timing = getPaywallTiming(5, 10, 50);
      expect(timing.shouldShow).toBe(false);
    });
  });

  describe("calculateUpgradeDiscount", () => {
    it("returns 15% for loyal users (30+ days)", () => {
      const discount = calculateUpgradeDiscount("free", "premium", 35);
      expect(discount.eligible).toBe(true);
      expect(discount.discountPercent).toBe(15);
      expect(discount.reason).toContain("rhythm");
    });

    it("returns 10% for 14+ days", () => {
      const discount = calculateUpgradeDiscount("free", "premium", 20);
      expect(discount.eligible).toBe(true);
      expect(discount.discountPercent).toBe(10);
    });

    it("returns no discount for new user", () => {
      const discount = calculateUpgradeDiscount("free", "premium", 5);
      expect(discount.eligible).toBe(false);
      expect(discount.discountPercent).toBe(0);
    });
  });

  describe("formatTierPrice", () => {
    it("formats price without discount", () => {
      const formatted = formatTierPrice("premium");
      expect(formatted.fullPrice).toBe("$9.99");
      expect(formatted.discountedPrice).toBe("$9.99");
      expect(formatted.savings).toBe("");
    });

    it("formats price with discount", () => {
      const formatted = formatTierPrice("premium", 20);
      expect(formatted.fullPrice).toBe("$9.99");
      expect(formatted.discountedPrice).toBe("$7.99");
      expect(formatted.savings).toContain("Save");
    });

    it("calculates correct savings", () => {
      const formatted = formatTierPrice("premium", 50);
      expect(formatted.savings).toBe("Save $5.00");
    });
  });

  describe("getFeatureComparison", () => {
    it("finds new features when upgrading", () => {
      const comparison = getFeatureComparison("free", "premium");
      expect(comparison.newFeatures.length).toBeGreaterThan(0);
    });

    it("returns empty for same tier", () => {
      const comparison = getFeatureComparison("premium", "premium");
      expect(comparison.newFeatures.length).toBe(0);
    });
  });

  describe("trackLadderInteraction", () => {
    it("tracks view without error", async () => {
      await expect(
        trackLadderInteraction("user-1", "viewed", "premium"),
      ).resolves.not.toThrow();
    });

    it("tracks selection without error", async () => {
      await expect(
        trackLadderInteraction("user-1", "selected_tier", "premium"),
      ).resolves.not.toThrow();
    });
  });
});
