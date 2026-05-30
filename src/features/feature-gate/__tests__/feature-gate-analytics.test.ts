// ── Mocks ──────────────────────────────────────────────────────────

// Mock Sentry
jest.mock("@sentry/react-native", () => ({
  __esModule: true,
  default: { addBreadcrumb: jest.fn() },
}));

// Mock eventBus
jest.mock("../../../events", () => ({
  eventBus: { emit: jest.fn() },
}));

// ── Imports after mocks ────────────────────────────────────────────

import {
  trackFeatureAccessAttempted,
  trackFeatureGateBlocked,
  trackFeatureGateAllowed,
  trackFeatureVisibilityChanged,
} from "../analytics";

// Get references to the mocked functions
const { default: Sentry } = jest.requireMock("@sentry/react-native") as {
  default: { addBreadcrumb: jest.Mock };
};
const { eventBus } = jest.requireMock("../../../events") as {
  eventBus: { emit: jest.Mock };
};

// ── Analytics ──────────────────────────────────────────────────────

describe("feature-gate analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("trackFeatureAccessAttempted", () => {
    it("adds Sentry breadcrumb with feature info", () => {
      trackFeatureAccessAttempted("challenges", "button_click", {
        screen: "home",
      });
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "feature-gate",
          message: "Feature access attempted: challenges",
          level: "info",
          data: expect.objectContaining({
            feature: "challenges",
            accessMethod: "button_click",
          }),
        }),
      );
    });

    it("emits eventBus event", () => {
      trackFeatureAccessAttempted("challenges", "nav");
      expect(eventBus.emit).toHaveBeenCalledWith(
        "feature-gate:access_attempted",
        expect.objectContaining({
          feature: "challenges",
          accessMethod: "nav",
        }),
      );
    });

    it("defaults context to empty object", () => {
      trackFeatureAccessAttempted("challenges", "tap");
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ context: {} }),
        }),
      );
    });
  });

  describe("trackFeatureGateBlocked", () => {
    it("adds Sentry breadcrumb with warning level", () => {
      trackFeatureGateBlocked("rankings", "archived", "/home");
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "feature-gate",
          level: "warning",
          data: expect.objectContaining({
            feature: "rankings",
            reason: "archived",
            fallbackRoute: "/home",
          }),
        }),
      );
    });

    it("emits eventBus event with timestamp", () => {
      trackFeatureGateBlocked("rivals", "disabled");
      expect(eventBus.emit).toHaveBeenCalledWith(
        "feature-gate:blocked",
        expect.objectContaining({
          feature: "rivals",
          reason: "disabled",
          timestamp: expect.any(Number),
        }),
      );
    });

    it("works without fallbackRoute", () => {
      expect(() =>
        trackFeatureGateBlocked("squads", "hidden"),
      ).not.toThrow();
    });
  });

  describe("trackFeatureGateAllowed", () => {
    it("adds Sentry breadcrumb with info level", () => {
      trackFeatureGateAllowed("challenges", "navigation");
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "feature-gate",
          level: "info",
          data: expect.objectContaining({
            feature: "challenges",
            accessMethod: "navigation",
          }),
        }),
      );
    });

    it("emits eventBus event", () => {
      trackFeatureGateAllowed("challenges", "route");
      expect(eventBus.emit).toHaveBeenCalledWith(
        "feature-gate:allowed",
        expect.objectContaining({
          feature: "challenges",
          accessMethod: "route",
        }),
      );
    });
  });

  describe("trackFeatureVisibilityChanged", () => {
    it("tracks visibility change with reason", () => {
      trackFeatureVisibilityChanged("challenges", false, true, "unlocked");
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            feature: "challenges",
            wasVisible: false,
            isVisible: true,
            reason: "unlocked",
          }),
        }),
      );
    });

    it("emits eventBus event", () => {
      trackFeatureVisibilityChanged("challenges", true, false, "archived");
      expect(eventBus.emit).toHaveBeenCalledWith(
        "feature-gate:visibility_changed",
        expect.objectContaining({
          feature: "challenges",
          wasVisible: true,
          isVisible: false,
          reason: "archived",
        }),
      );
    });

    it("works without reason", () => {
      expect(() =>
        trackFeatureVisibilityChanged("challenges", true, false),
      ).not.toThrow();
    });
  });
});
