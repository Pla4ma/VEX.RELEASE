import {
  FINAL_RELEASE_FEATURE_MAP,
  isFeatureHidden,
  getFeatureStatus,
  FINAL_RELEASE_HIDDEN_SYSTEMS,
} from "../final-release-feature-map";
import {
  DISABLED_FEATURES,
  FEATURE_RELEASE_STATES,
} from "../feature-access-config";
import type { FeatureKey } from "../feature-access";

const HIDDEN_FEATURE_KEYS: FeatureKey[] = [
  "shop",
  "inventory",
  "battle_pass",
  "wagers",
  "rivals",
  "squads",
  "social_tab",
  "rankings",
  "economy_basic",
  "economy_advanced",
  "gems_prominent",
  "streak_insurance",
  "boss_bounties",
  "seasonal_features",
];

describe("Final Release Feature Map Enforcement", () => {
  it("hidden features are marked final_release_deactivated in release states", () => {
    for (const key of HIDDEN_FEATURE_KEYS) {
      const state = FEATURE_RELEASE_STATES[key];
      if (state !== undefined) {
        expect(["final_release_deactivated", "archived"]).toContain(state);
      }
    }
  });

  it("hidden features are all in DISABLED_FEATURES list", () => {
    const disabledSet = new Set(DISABLED_FEATURES);
    for (const key of HIDDEN_FEATURE_KEYS) {
      expect(disabledSet.has(key)).toBe(true);
    }
  });

  it("FINAL_RELEASE_HIDDEN_SYSTEMS covers economy/social features", () => {
    const hiddenSystems = FINAL_RELEASE_HIDDEN_SYSTEMS as readonly string[];
    expect(hiddenSystems).toContain("shop");
    expect(hiddenSystems).toContain("inventory");
    expect(hiddenSystems).toContain("battle_pass");
    expect(hiddenSystems).toContain("wagers");
    expect(hiddenSystems).toContain("rivals");
    expect(hiddenSystems).toContain("squads_social");
    expect(hiddenSystems).toContain("leaderboards");
    expect(hiddenSystems).toContain("premium_currency");
    expect(hiddenSystems).toContain("advanced_economy");
  });

  it("isFeatureHidden returns true for all hidden economy/social features", () => {
    expect(isFeatureHidden("shop")).toBe(true);
    expect(isFeatureHidden("inventory")).toBe(true);
    expect(isFeatureHidden("battle_pass")).toBe(true);
    expect(isFeatureHidden("wagers")).toBe(true);
    expect(isFeatureHidden("rivals")).toBe(true);
    expect(isFeatureHidden("squads")).toBe(true);
    expect(isFeatureHidden("social_tab")).toBe(true);
    expect(isFeatureHidden("rankings")).toBe(true);
    expect(isFeatureHidden("economy_basic")).toBe(true);
    expect(isFeatureHidden("economy_advanced")).toBe(true);
    expect(isFeatureHidden("gems_prominent")).toBe(true);
    expect(isFeatureHidden("streak_insurance")).toBe(true);
    expect(isFeatureHidden("boss_bounties")).toBe(true);
    expect(isFeatureHidden("seasonal_features")).toBe(true);
  });

  it("core features are NOT hidden", () => {
    expect(isFeatureHidden("focus_session")).toBe(false);
    expect(isFeatureHidden("progress_view")).toBe(false);
    expect(isFeatureHidden("ai_coach_basic")).toBe(false);
    expect(isFeatureHidden("home_tab")).toBe(false);
    expect(isFeatureHidden("profile_tab")).toBe(false);
    expect(isFeatureHidden("content_study")).toBe(false);
  });

  it("boss has no squad/community dependency in final release", () => {
    expect(isFeatureHidden("squads")).toBe(true);
    expect(isFeatureHidden("social_tab")).toBe(true);
    const bossEntry = FINAL_RELEASE_FEATURE_MAP.boss_tab;
    expect(bossEntry).toBeDefined();
    expect(bossEntry.status).toBe("progressive");
  });

  it("premium paywall does not reference hidden economy features", () => {
    const premiumEntry = FINAL_RELEASE_FEATURE_MAP.premium_paywall;
    expect(premiumEntry).toBeDefined();
    expect(premiumEntry.note).toBeDefined();
    expect(premiumEntry.note).not.toContain("shop");
    expect(premiumEntry.note).not.toContain("gems");
    expect(premiumEntry.note).not.toContain("battle pass");
    expect(premiumEntry.note).not.toContain("inventory");
  });

  it("all hidden features have status hidden in FINAL_RELEASE_FEATURE_MAP", () => {
    for (const key of HIDDEN_FEATURE_KEYS) {
      expect(getFeatureStatus(key)).toBe("hidden");
    }
  });
});
