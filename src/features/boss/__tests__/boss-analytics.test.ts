/**
 * Tests for boss analytics
 */

import {
  BOSS_ANALYTICS_EVENTS,
  trackBossEvent,
  trackBossRouteOpened,
  trackBossCTAClicked,
  trackCombatAbilityActivated,
} from "../analytics";

describe("boss analytics", () => {
  it("BOSS_ANALYTICS_EVENTS is an empty array", () => {
    expect(BOSS_ANALYTICS_EVENTS).toEqual([]);
  });

  it("trackBossEvent is a no-op function", () => {
    expect(() => trackBossEvent()).not.toThrow();
  });

  it("trackBossRouteOpened accepts all args", () => {
    expect(() => trackBossRouteOpened("user-1", "high", true)).not.toThrow();
  });

  it("trackBossRouteOpened works with no args", () => {
    expect(() => trackBossRouteOpened()).not.toThrow();
  });

  it("trackBossCTAClicked accepts all args", () => {
    expect(() => trackBossCTAClicked("user-1", 25, "intense")).not.toThrow();
  });

  it("trackCombatAbilityActivated accepts all args", () => {
    expect(() =>
      trackCombatAbilityActivated("u1", "e1", "fireball", 50, true),
    ).not.toThrow();
  });
});
