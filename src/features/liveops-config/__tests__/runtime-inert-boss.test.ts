import {
  featuresAt,
  getFeatureAvailability,
  routeNotificationAction,
  FEATURE_ROUTE_REGISTRY,
} from "./runtime-inert.helpers";

describe("Locked boss route gating", () => {
  it("boss route in registry but blocked by FeatureAvailability", () => {
    const bossInRegistry = FEATURE_ROUTE_REGISTRY.some(
      (r) => r.feature === "boss_tab" && r.route === "Boss",
    );
    expect(bossInRegistry).toBe(true);
  });

  it("cannot register route at day 0", () => {
    const features = featuresAt(0);
    const avail = getFeatureAvailability(features.boss_tab);
    expect(avail.canRegisterRoute).toBe(false);
  });

  it("can register boss route after unlock", () => {
    const features = featuresAt(7);
    const avail = getFeatureAvailability(features.boss_tab);
    expect(avail.canRegisterRoute).toBe(true);
    expect(avail.canNavigate).toBe(true);
  });

  it("notification route to boss blocked when locked", () => {
    const locked = featuresAt(0);
    const nav = { navigate: jest.fn() };
    const result = routeNotificationAction(nav, { type: "view_boss" }, locked);
    expect(result.success).toBe(true);
    expect(result.screen).not.toBe("Boss");
    expect(result.screen).toBe("Home");
  });

  it("notification route to boss allowed when unlocked", () => {
    const unlocked = featuresAt(7);
    const nav = { navigate: jest.fn() };
    const result = routeNotificationAction(
      nav,
      { type: "view_boss" },
      unlocked,
    );
    expect(result.success).toBe(true);
  });
});
