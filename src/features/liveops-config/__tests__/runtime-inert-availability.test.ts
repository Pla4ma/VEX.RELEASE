import {
  featuresAt,
  getFeatureAvailability,
  routeNotificationAction,
  ALL_HIDDEN_FINAL_RELEASE,
  HIDDEN_BOOT_FEATURES,
} from "./runtime-inert.helpers";

describe("FeatureAvailability blocks query + subscription (not only UI)", () => {
  it("locked features block canQuery independent of canRenderEntryPoint", () => {
    const features = featuresAt(0);
    for (const key of HIDDEN_BOOT_FEATURES) {
      const avail = getFeatureAvailability(features[key]);
      expect(avail.canQuery).toBe(false);
      expect(avail.canSubscribeToEvents).toBe(false);
    }
  });

  it("teased features can render entry point but NOT query or subscribe", () => {
    const features = featuresAt(2);
    const avail = getFeatureAvailability(features.companion_detail);
    expect(avail.state).toBe("teased");
    expect(avail.canRenderEntryPoint).toBe(true);
    expect(avail.canQuery).toBe(false);
    expect(avail.canSubscribeToEvents).toBe(false);
    expect(avail.canUseBackend).toBe(false);
  });

  it("degraded features block queries, events, and notifications while keeping route", () => {
    const features = featuresAt(7, ["boss_tab"]);
    const avail = getFeatureAvailability(features.boss_tab);
    expect(avail.state).toBe("degraded");
    expect(avail.canRenderEntryPoint).toBe(true);
    expect(avail.canRegisterRoute).toBe(true);
    expect(avail.canNavigate).toBe(false);
    expect(avail.canQuery).toBe(false);
    expect(avail.canUseBackend).toBe(false);
    expect(avail.canSubscribeToEvents).toBe(false);
    expect(avail.canShowNotification).toBe(false);
  });

  it("cannot navigate battle pass or squads notification routes", () => {
    const features = featuresAt(10);
    const nav = { navigate: jest.fn() };
    const squadResult = routeNotificationAction(
      nav,
      { type: "view_squad" },
      features,
    );
    expect(squadResult.success).toBe(true);
    expect(squadResult.screen).toBe("Home");
    const duelResult = routeNotificationAction(
      nav,
      { type: "join_duel" },
      features,
    );
    expect(duelResult.success).toBe(true);
    expect(duelResult.screen).toBe("Home");
    const shopResult = routeNotificationAction(
      nav,
      { type: "open_shop" },
      features,
    );
    expect(shopResult.success).toBe(true);
    expect(shopResult.screen).toBe("Home");
    const chestResult = routeNotificationAction(
      nav,
      { type: "open_chest" },
      features,
    );
    expect(chestResult.success).toBe(true);
    expect(chestResult.screen).toBe("Home");
  });

  it("economy_advanced wallet mutations blocked via canQuery + canUseBackend", () => {
    const features = featuresAt(10);
    const avail = getFeatureAvailability(features.economy_advanced);
    expect(avail.canQuery).toBe(false);
    expect(avail.canUseBackend).toBe(false);
    expect(avail.canSubscribeToEvents).toBe(false);
  });

  it("hidden features blocked on all 7 gates simultaneously", () => {
    const features = featuresAt(0);
    const gates: Array<keyof ReturnType<typeof getFeatureAvailability>> = [
      "canRenderEntryPoint",
      "canNavigate",
      "canQuery",
      "canUseBackend",
      "canRegisterRoute",
      "canSubscribeToEvents",
      "canShowNotification",
    ];
    for (const key of ALL_HIDDEN_FINAL_RELEASE) {
      const avail = getFeatureAvailability(features[key]);
      for (const gate of gates) {
        expect(avail[gate]).toBe(false);
      }
    }
  });

  it("all hidden features remain blocked at session 50 (never unlock)", () => {
    const features = featuresAt(50);
    for (const key of ALL_HIDDEN_FINAL_RELEASE) {
      const avail = getFeatureAvailability(features[key]);
      expect(avail.canQuery).toBe(false);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canSubscribeToEvents).toBe(false);
    }
  });
});
