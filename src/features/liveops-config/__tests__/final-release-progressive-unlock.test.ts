/**
 * Final Release Progressive Unlock Test
 *
 * Verifies:
 * - Progressively unlocked features are inert before minimum session threshold
 * - FeatureAvailability gates work correctly
 * - Archived features are never unlocked regardless of session count
 */

import { buildFeatureAccess } from "../feature-access";
import { FEATURE_THRESHOLDS } from "../feature-access-config";
import type { FeatureKey } from "../feature-access";

const PROGRESSIVELY_UNLOCKED: FeatureKey[] = [
  "boss_tab",
  "achievements",
  "challenges",
  "ai_coach_advanced",
  "content_study_advanced",
  "quiz_review_mode",
];

const ALWAYS_HIDDEN: FeatureKey[] = [
  "shop",
  "inventory",
  "battle_pass",
  "wagers",
  "rivals",
  "squads",
  "rankings",
  "economy_advanced",
  "gems_prominent",
  "social_tab",
  "streak_insurance",
  "seasonal_features",
  "boss_bounties",
];

describe("Progressive Unlock — Locked Before Threshold", () => {
  it("progressively unlocked features are locked at session 0", () => {
    const result = buildFeatureAccess({
      totalCompletedSessions: 0,
    });

    for (const feature of PROGRESSIVELY_UNLOCKED) {
      expect(result.features[feature]!.isUnlocked).toBe(false);
    }
  });

  it("progressively unlocked features are locked at session 1", () => {
    const result = buildFeatureAccess({
      totalCompletedSessions: 1,
    });

    // boss_tab unlocks at 7, achievements at 6, challenges at 5, etc.
    for (const feature of PROGRESSIVELY_UNLOCKED) {
      expect(result.features[feature]!.isUnlocked).toBe(false);
    }
  });

  it("features unlock at their configured threshold", () => {
    // Some features have dependency chains — need enough sessions for all deps
    const sessionOverride: Partial<Record<FeatureKey, number>> = {
      quiz_review_mode: 12, // needs content_study (threshold 12)
      content_study_advanced: 18, // needs content_study (12) + ai_coach_advanced (8)
    };

    for (const feature of PROGRESSIVELY_UNLOCKED) {
      const threshold =
        sessionOverride[feature] ?? FEATURE_THRESHOLDS[feature] ?? 0;
      const result = buildFeatureAccess({
        totalCompletedSessions: threshold,
      });

      expect(result.features[feature]!.isUnlocked).toBe(true);
    }
  });

  it("features are locked at threshold - 1", () => {
    for (const feature of PROGRESSIVELY_UNLOCKED) {
      const threshold = FEATURE_THRESHOLDS[feature] ?? 0;
      if (threshold <= 0) continue;

      const result = buildFeatureAccess({
        totalCompletedSessions: threshold - 1,
      });

      expect(result.features[feature]!.isUnlocked).toBe(false);
    }
  });
});

describe("Archived Features — Never Unlocked", () => {
  [0, 1, 5, 10, 50, 100, 1000].forEach((sessions) => {
    it(`archived features are locked at ${sessions} sessions`, () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: sessions,
      });

      for (const feature of ALWAYS_HIDDEN) {
        expect(result.features[feature]!.isUnlocked).toBe(false);
      }
    });
  });
});

describe("Archived Features — Threshold is POSITIVE_INFINITY", () => {
  it("all archived features have Number.POSITIVE_INFINITY threshold", () => {
    for (const feature of ALWAYS_HIDDEN) {
      expect(FEATURE_THRESHOLDS[feature]).toBe(Number.POSITIVE_INFINITY);
    }
  });
});

describe("Core Features — Always Available", () => {
  const coreFeatures: FeatureKey[] = [
    "focus_session",
    "home_tab",
    "focus_tab",
    "profile_tab",
    "progress_view",
    "ai_coach_basic",
  ];

  it("core features are available at session 0", () => {
    const result = buildFeatureAccess({
      totalCompletedSessions: 0,
    });

    for (const feature of coreFeatures) {
      expect(result.features[feature]!.isUnlocked).toBe(true);
    }
  });
});
