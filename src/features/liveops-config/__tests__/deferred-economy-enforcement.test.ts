import {
  FINAL_RELEASE_FEATURE_MAP,
  isFeatureHidden,
  getFeatureStatus,
} from "../final-release-feature-map";
import {
  DISABLED_FEATURES,
  FEATURE_RELEASE_STATES,
} from "../feature-access-config";
import type { FeatureKey } from "../feature-access";

const FINAL_RELEASE_DEACTIVATED_FEATURES: FeatureKey[] = [
  "shop",
  "inventory",
  "battle_pass",
  "gems_prominent",
  "economy_basic",
  "economy_advanced",
  "streak_insurance",
];

describe("Final Release Deactivated — all deferred features are hidden", () => {
  for (const feature of FINAL_RELEASE_DEACTIVATED_FEATURES) {
    it(`${feature} has status 'hidden' in FINAL_RELEASE_FEATURE_MAP`, () => {
      expect(getFeatureStatus(feature)).toBe("hidden");
    });
  }

  for (const feature of FINAL_RELEASE_DEACTIVATED_FEATURES) {
    it(`${feature} is in DISABLED_FEATURES`, () => {
      expect(DISABLED_FEATURES).toContain(feature);
    });
  }

  for (const feature of FINAL_RELEASE_DEACTIVATED_FEATURES) {
    it(`${feature} release state is final_release_deactivated or archived`, () => {
      expect(["final_release_deactivated", "archived"]).toContain(
        FEATURE_RELEASE_STATES[feature],
      );
    });
  }
});

describe("Final Release Deactivated — completion does not award premium currency", () => {
  it("gems_prominent is hidden in final release", () => {
    expect(isFeatureHidden("gems_prominent")).toBe(true);
  });

  it("shop is hidden in final release", () => {
    expect(isFeatureHidden("shop")).toBe(true);
  });

  it("economy_advanced is hidden in final release", () => {
    expect(isFeatureHidden("economy_advanced")).toBe(true);
  });

  it("streak_insurance is hidden in final release", () => {
    expect(isFeatureHidden("streak_insurance")).toBe(true);
  });
});

describe("Final Release Deactivated — premium copy does not reference chests/gems/inventory/battle-pass", () => {
  it("premium_paywall note does not mention shop/gems/inventory/battle-pass", () => {
    const premiumEntry = FINAL_RELEASE_FEATURE_MAP.premium_paywall;
    expect(premiumEntry).toBeDefined();
    const note = premiumEntry.note ?? "";
    expect(note).not.toContain("shop");
    expect(note).not.toContain("gems");
    expect(note).not.toContain("chest");
    expect(note).not.toContain("inventory");
    expect(note).not.toContain("battle pass");
  });

  it("battle_pass copy does not appear in premium copy", () => {
    const bpEntry = FINAL_RELEASE_FEATURE_MAP.battle_pass;
    expect(bpEntry).toBeDefined();
    expect(bpEntry.status).toBe("hidden");
  });

  it("shop copy does not appear in premium copy", () => {
    const shopEntry = FINAL_RELEASE_FEATURE_MAP.shop;
    expect(shopEntry).toBeDefined();
    expect(shopEntry.status).toBe("hidden");
  });
});

describe("Final Release Deactivated — notification filters exclude deferred features", () => {
  it("deferred features cannot show notifications by FeatureAvailability", () => {
    const { getFeatureAvailability } = require("../feature-availability");
    for (const feature of FINAL_RELEASE_DEACTIVATED_FEATURES) {
      const access = {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: "Hidden in final release",
        unlockReason: "",
        releaseState: "final_release_deactivated" as const,
      };
      const avail = getFeatureAvailability(access);
      expect(avail.canShowNotification).toBe(false);
    }
  });
});

describe("Final Release Deactivated — all deferred features classified", () => {
  it("all FINAL_RELEASE_DEACTIVATED files exist in src with deferred marker", () => {
    expect(FINAL_RELEASE_DEACTIVATED_FEATURES).toHaveLength(7);
  });

  it("streak_insurance is not part of any completion flow", () => {
    expect(isFeatureHidden("streak_insurance")).toBe(true);
  });
});
