/**
 * Liveops Config Feature — Feature config constants Tests
 * Covers: FEATURE_THRESHOLDS, FEATURE_RELEASE_STATES, FEATURE_TEASER_STARTS, DISABLED_FEATURES
 */

import {
  FEATURE_THRESHOLDS,
  FEATURE_RELEASE_STATES,
  FEATURE_TEASER_STARTS,
  DISABLED_FEATURES,
} from "../feature-access-config";

describe("FEATURE_THRESHOLDS", () => {
  it("core features have 0 threshold", () => {
    expect(FEATURE_THRESHOLDS.focus_session).toBe(0);
    expect(FEATURE_THRESHOLDS.home_tab).toBe(0);
    expect(FEATURE_THRESHOLDS.focus_tab).toBe(0);
  });

  it("deactivated features have Infinity threshold", () => {
    expect(FEATURE_THRESHOLDS.battle_pass).toBe(Infinity);
    expect(FEATURE_THRESHOLDS.squads).toBe(Infinity);
    expect(FEATURE_THRESHOLDS.rivals).toBe(Infinity);
  });

  it("progressive features have finite positive thresholds", () => {
    expect(FEATURE_THRESHOLDS.challenges).toBeGreaterThan(0);
    expect(FEATURE_THRESHOLDS.challenges).not.toBe(Infinity);
    expect(FEATURE_THRESHOLDS.boss_tab).toBeGreaterThan(0);
    expect(FEATURE_THRESHOLDS.boss_tab).not.toBe(Infinity);
  });
});

describe("FEATURE_RELEASE_STATES", () => {
  it("core features are final_release_core", () => {
    expect(FEATURE_RELEASE_STATES.focus_session).toBe("final_release_core");
    expect(FEATURE_RELEASE_STATES.home_tab).toBe("final_release_core");
  });

  it("disabled features are final_release_deactivated", () => {
    for (const key of DISABLED_FEATURES) {
      expect(FEATURE_RELEASE_STATES[key]).toBe("final_release_deactivated");
    }
  });
});

describe("FEATURE_TEASER_STARTS", () => {
  it("defines teaser starts for progressive features", () => {
    expect(FEATURE_TEASER_STARTS.companion_detail).toBe(2);
    expect(FEATURE_TEASER_STARTS.challenges).toBe(4);
    expect(FEATURE_TEASER_STARTS.boss_tab).toBe(5);
  });
});

describe("DISABLED_FEATURES", () => {
  it("includes known deactivated features", () => {
    expect(DISABLED_FEATURES).toContain("squads");
    expect(DISABLED_FEATURES).toContain("social_tab");
    expect(DISABLED_FEATURES).toContain("rivals");
    expect(DISABLED_FEATURES).toContain("battle_pass");
  });
});
