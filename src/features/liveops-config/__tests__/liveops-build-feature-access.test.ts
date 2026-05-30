/**
 * Liveops Config Feature — buildFeatureAccess Tests
 */

import { buildFeatureAccess } from "../feature-access";
import type { FeatureKey, MotivationProfile } from "../feature-access-types";

describe("buildFeatureAccess", () => {
  it("returns features, productTier, and stage", () => {
    const result = buildFeatureAccess({ totalCompletedSessions: 0 });
    expect(result.features).toBeDefined();
    expect(result.productTier).toBeDefined();
    expect(result.stage).toBeDefined();
  });

  it("unlocks core features for new user", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    expect(features.focus_session.isUnlocked).toBe(true);
    expect(features.home_tab.isUnlocked).toBe(true);
    expect(features.focus_tab.isUnlocked).toBe(true);
    expect(features.profile_tab.isUnlocked).toBe(true);
  });

  it("locks features requiring higher sessions", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    expect(features.challenges.isUnlocked).toBe(false);
    expect(features.boss_tab.isUnlocked).toBe(false);
  });

  it("unlocks progressive features as sessions increase", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 10 });
    expect(features.companion_detail.isUnlocked).toBe(true);
    expect(features.challenges.isUnlocked).toBe(true);
    expect(features.achievements.isUnlocked).toBe(true);
  });

  it("marks deactivated features as never unlocked", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 100 });
    expect(features.battle_pass.isUnlocked).toBe(false);
    expect(features.squads.isUnlocked).toBe(false);
    expect(features.rivals.isUnlocked).toBe(false);
  });

  it("respects degraded features", () => {
    const degraded = new Set<FeatureKey>(["challenges"]);
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 10,
      degradedFeatures: degraded,
    });
    expect(features.challenges.isDegraded).toBe(true);
  });

  it("returns correct stage and product tier", () => {
    const result = buildFeatureAccess({ totalCompletedSessions: 5 });
    expect(result.stage).toBe("ENGAGED");
    expect(result.productTier).toBe("COACHING");
  });

  it("applies motivation profile acceleration", () => {
    const profile: MotivationProfile = { primary: "game_like", secondary: [] };
    const base = buildFeatureAccess({ totalCompletedSessions: 4 });
    const accelerated = buildFeatureAccess({ totalCompletedSessions: 4, motivationProfile: profile });
    // challenges has threshold 5, game_like accelerates by 2, so threshold becomes 3
    expect(base.features.challenges.isUnlocked).toBe(false);
    expect(accelerated.features.challenges.isUnlocked).toBe(true);
  });
});
