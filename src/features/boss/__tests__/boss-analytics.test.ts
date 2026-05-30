import {
  BOSS_ANALYTICS_EVENTS,
  trackBossEvent,
  trackBossRouteOpened,
  trackBossCTAClicked,
  trackCombatAbilityActivated,
} from "../analytics";

describe("Boss analytics (all stubs)", () => {
  it("BOSS_ANALYTICS_EVENTS is an empty readonly array", () => {
    expect(BOSS_ANALYTICS_EVENTS).toEqual([]);
    expect(Array.isArray(BOSS_ANALYTICS_EVENTS)).toBe(true);
  });

  it("trackBossEvent is a void function", () => {
    expect(trackBossEvent()).toBeUndefined();
  });

  it("trackBossRouteOpened accepts all arg combinations", () => {
    expect(() => trackBossRouteOpened()).not.toThrow();
    expect(() => trackBossRouteOpened("user-1")).not.toThrow();
    expect(() => trackBossRouteOpened("user-1", "high")).not.toThrow();
    expect(() => trackBossRouteOpened("user-1", "high", true)).not.toThrow();
    expect(() => trackBossRouteOpened(null, undefined, false)).not.toThrow();
  });

  it("trackBossCTAClicked accepts all arg combinations", () => {
    expect(() => trackBossCTAClicked()).not.toThrow();
    expect(() => trackBossCTAClicked("user-1")).not.toThrow();
    expect(() => trackBossCTAClicked("user-1", 25, "intense")).not.toThrow();
  });

  it("trackCombatAbilityActivated accepts all arg combinations", () => {
    expect(() => trackCombatAbilityActivated()).not.toThrow();
    expect(() =>
      trackCombatAbilityActivated("u1", "e1", "fireball", 50, true),
    ).not.toThrow();
  });
});
