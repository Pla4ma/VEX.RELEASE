/**
 * Final Release Scope Test
 *
 * Verifies:
 * - Archived/deactivated features are properly gated
 * - Feature map correctly classifies all features
 * - No archived feature bypasses the FeatureAvailability gates
 */

import {
  FINAL_RELEASE_FEATURE_MAP,
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
} from "../final-release-feature-map";
import {
  DISABLED_FEATURES,
  FEATURE_RELEASE_STATES,
} from "../feature-access-config";
import type { FeatureKey } from "../feature-access";

const ARCHIVED_FEATURES: FeatureKey[] = [
  "shop",
  "inventory",
  "battle_pass",
  "wagers",
  "rivals",
  "squads",
  "rankings",
  "economy_advanced",
  "economy_basic",
  "gems_prominent",
  "social_tab",
  "boss_bounties",
  "streak_insurance",
  "seasonal_features",
];

const FINAL_RELEASE_ACTIVE: FeatureKey[] = [
  "focus_session",
  "progress_view",
  "home_tab",
  "focus_tab",
  "profile_tab",
  "ai_coach_basic",
  "companion_detail",
  "content_study",
  "advanced_settings",
];

const PROGRESSIVELY_UNLOCKED: FeatureKey[] = [
  "boss_tab",
  "achievements",
  "challenges",
  "ai_coach_advanced",
  "content_study_advanced",
  "quiz_review_mode",
  "premium_paywall",
];

describe("Final Release Scope — Feature Classification", () => {
  it("all features have an entry in FINAL_RELEASE_FEATURE_MAP", () => {
    const allKeys = [
      ...ARCHIVED_FEATURES,
      ...FINAL_RELEASE_ACTIVE,
      ...PROGRESSIVELY_UNLOCKED,
    ];
    for (const key of allKeys) {
      expect(FINAL_RELEASE_FEATURE_MAP[key]).toBeDefined();
    }
  });

  it("archived features are hidden in feature map", () => {
    for (const feature of ARCHIVED_FEATURES) {
      expect(isFeatureHidden(feature)).toBe(true);
      expect(isFeatureIncluded(feature)).toBe(false);
    }
  });

  it("active features are included in feature map", () => {
    for (const feature of FINAL_RELEASE_ACTIVE) {
      expect(isFeatureIncluded(feature)).toBe(true);
      expect(isFeatureHidden(feature)).toBe(false);
    }
  });

  it("progressive features are not hidden (progressive or premium_gated)", () => {
    for (const feature of PROGRESSIVELY_UNLOCKED) {
      expect(isFeatureHidden(feature)).toBe(false);
      const status = getFeatureStatus(feature);
      expect(["progressive", "premium_gated"]).toContain(status);
    }
  });

  it("archived features are in DISABLED_FEATURES array", () => {
    for (const feature of ARCHIVED_FEATURES) {
      expect(DISABLED_FEATURES).toContain(feature);
    }
  });

  it("archived features have final_release_deactivated release state", () => {
    for (const feature of ARCHIVED_FEATURES) {
      expect(FEATURE_RELEASE_STATES[feature]).toBe("final_release_deactivated");
    }
  });

  it("active features have final-release core or progressive release state", () => {
    for (const feature of FINAL_RELEASE_ACTIVE) {
      const state = FEATURE_RELEASE_STATES[feature];
      expect(["final_release_core", "final_release_progressive"]).toContain(
        state,
      );
    }
  });
});

describe("Final Release Scope — Feature Map Integrity", () => {
  it("every feature key in DISABLED_FEATURES is hidden in feature map", () => {
    for (const feature of DISABLED_FEATURES) {
      expect(isFeatureHidden(feature)).toBe(true);
    }
  });

  it("no final-release active feature is in DISABLED_FEATURES", () => {
    for (const feature of FINAL_RELEASE_ACTIVE) {
      expect(DISABLED_FEATURES).not.toContain(feature);
    }
  });

  it("premium_paywall is progressive not hidden", () => {
    expect(isFeatureHidden("premium_paywall")).toBe(false);
    expect(getFeatureStatus("premium_paywall")).toBe("progressive");
  });

  it("streak_insurance is hidden", () => {
    expect(isFeatureHidden("streak_insurance")).toBe(true);
  });
});
