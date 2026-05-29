/**
 * Comprehensive tests for the feature-gate feature
 * Covers: hooks (useFeatureGate, useMultiFeatureGate),
 * analytics (trackFeatureAccessAttempted, trackFeatureGateBlocked,
 *   trackFeatureGateAllowed, trackFeatureVisibilityChanged),
 * verification (getPhase3VerificationSummary),
 * components (FeatureGate, withFeatureGate, NavigationGate)
 */

// ── Mocks ──────────────────────────────────────────────────────────

jest.mock("@sentry/react-native", () => ({
  __esModule: true,
  default: { addBreadcrumb: jest.fn() },
}));

jest.mock("../../../events", () => ({
  eventBus: { emit: jest.fn() },
}));

jest.mock("../../liveops-config/hooks/useFeatureAccess", () => ({
  useFeatureAccess: jest.fn(),
}));

jest.mock("../../liveops-config/feature-availability", () => ({
  getFeatureAvailability: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

jest.mock("../../../theme", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: { primary: "#000" },
        text: { primary: "#fff", secondary: "#aaa" },
      },
      spacing: { 4: 16 },
    },
  }),
}));

jest.mock("../../../components/primitives/Box", () => ({ Box: "View" }));
jest.mock("../../../components/primitives/Text", () => ({ Text: "Text" }));
jest.mock("../../../components/primitives/Button", () => ({
  Button: "Button",
}));

jest.mock("../../../theme/tokens/sizing", () => ({
  sizing: { width: { xl: 400 }, icon: { "2xl": 32 } },
}));

// ── Imports after mocks ────────────────────────────────────────────

import { useFeatureGate, useMultiFeatureGate } from "../hooks";
import type { FeatureGateMode, UseFeatureGateResult } from "../hooks";
import { renderHook } from "@testing-library/react-native";
import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { FeatureGate, withFeatureGate } from "../FeatureGate";
import { NavigationGate } from "../NavigationGate";
import {
  trackFeatureAccessAttempted,
  trackFeatureGateBlocked,
  trackFeatureGateAllowed,
  trackFeatureVisibilityChanged,
} from "../analytics";
import { getPhase3VerificationSummary } from "../verification";

// Get mock references
const { useFeatureAccess: mockUseFeatureAccess } = jest.requireMock(
  "../../liveops-config/hooks/useFeatureAccess",
) as { useFeatureAccess: jest.Mock };
const { getFeatureAvailability: mockGetFeatureAvailability } =
  jest.requireMock("../../liveops-config/feature-availability") as {
    getFeatureAvailability: jest.Mock;
  };
const { default: Sentry } = jest.requireMock("@sentry/react-native") as {
  default: { addBreadcrumb: jest.Mock };
};
const { eventBus } = jest.requireMock("../../../events") as {
  eventBus: { emit: jest.Mock };
};

// ── Helpers ────────────────────────────────────────────────────────

function makeAvailability(overrides: Record<string, unknown> = {}) {
  return {
    state: "unlocked",
    canRenderEntryPoint: true,
    canNavigate: true,
    canQuery: true,
    canUseBackend: true,
    canRegisterRoute: true,
    canSubscribeToEvents: true,
    canShowNotification: true,
    reason: "Unlocked",
    ...overrides,
  };
}

function makeFeatureAccess(overrides: Record<string, unknown> = {}) {
  return {
    key: "challenges",
    isUnlocked: true,
    isVisible: true,
    isTeased: false,
    isDegraded: false,
    lockedDescription: "Locked feature",
    recommendedUnlockMoment: "After 5 sessions",
    unlockReason: "Feature unlocked",
    releaseState: "final_release_progressive",
    priority: 10,
    ...overrides,
  };
}

function setupFeatureGate(
  featureKey: string,
  featureAccess: Record<string, unknown>,
  availability: Record<string, unknown>,
) {
  mockUseFeatureAccess.mockReturnValue({
    features: { [featureKey]: featureAccess },
  });
  mockGetFeatureAvailability.mockReturnValue(makeAvailability(availability));
}

// ── Hooks: useFeatureGate ──────────────────────────────────────────

describe("useFeatureGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns isAvailable true for unlocked features (default mode)", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { state: "unlocked" },
    );

    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isUnlocked).toBe(true);
    expect(result.current.isDegraded).toBe(false);
  });

  it("returns isAvailable false for locked features", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: false }),
      {
        state: "locked",
        canRenderEntryPoint: false,
        canNavigate: false,
        canQuery: false,
      },
    );

    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isUnlocked).toBe(false);
  });

  it("returns isDegraded true for degraded features", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true, isDegraded: true }),
      { state: "degraded" },
    );

    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.isDegraded).toBe(true);
    expect(result.current.isAvailable).toBe(true);
  });

  it("entryPoint mode checks canRenderEntryPoint (true)", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess(),
      { canRenderEntryPoint: true },
    );
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "entryPoint"),
    );
    expect(result.current.isAvailable).toBe(true);
  });

  it("entryPoint mode checks canRenderEntryPoint (false)", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess(),
      { canRenderEntryPoint: false },
    );
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "entryPoint"),
    );
    expect(result.current.isAvailable).toBe(false);
  });

  it("navigation mode requires both canNavigate and canRegisterRoute", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess(),
      { canNavigate: true, canRegisterRoute: true },
    );
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "navigation"),
    );
    expect(result.current.isAvailable).toBe(true);
  });

  it("navigation mode fails if canNavigate is false", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess(),
      { canNavigate: false, canRegisterRoute: true },
    );
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "navigation"),
    );
    expect(result.current.isAvailable).toBe(false);
  });

  it("navigation mode fails if canRegisterRoute is false", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess(),
      { canNavigate: true, canRegisterRoute: false },
    );
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "navigation"),
    );
    expect(result.current.isAvailable).toBe(false);
  });

  it("query mode requires both canQuery and canUseBackend", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess(),
      { canQuery: true, canUseBackend: true },
    );
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "query"),
    );
    expect(result.current.isAvailable).toBe(true);
  });

  it("query mode fails if canQuery is false", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess(),
      { canQuery: false, canUseBackend: true },
    );
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "query"),
    );
    expect(result.current.isAvailable).toBe(false);
  });

  it("route mode checks canRegisterRoute", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), {
      canRegisterRoute: true,
    });
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "route"),
    );
    expect(result.current.isAvailable).toBe(true);
  });

  it("event mode checks canSubscribeToEvents", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), {
      canSubscribeToEvents: false,
    });
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "event"),
    );
    expect(result.current.isAvailable).toBe(false);
  });

  it("notification mode checks canShowNotification", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), {
      canShowNotification: true,
    });
    const { result } = renderHook(() =>
      useFeatureGate("challenges", "notification"),
    );
    expect(result.current.isAvailable).toBe(true);
  });

  it("exposes lockedDescription, unlockReason, recommendedUnlockMoment", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({
        isUnlocked: false,
        lockedDescription: "Complete 5 sessions",
        unlockReason: "Feature now available",
        recommendedUnlockMoment: "After day 3",
      }),
      { state: "locked" },
    );

    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.lockedDescription).toBe("Complete 5 sessions");
    expect(result.current.unlockReason).toBe("Feature now available");
    expect(result.current.recommendedUnlockMoment).toBe("After day 3");
  });

  it("exposes isVisible from featureAccess", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isVisible: false }),
      { state: "locked" },
    );
    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.isVisible).toBe(false);
  });

  it("availability object is passed through", () => {
    const availability = makeAvailability({ state: "unlocked", reason: "test" });
    mockUseFeatureAccess.mockReturnValue({
      features: { challenges: makeFeatureAccess() },
    });
    mockGetFeatureAvailability.mockReturnValue(availability);

    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.availability).toEqual(availability);
  });
});

// ── Hooks: useMultiFeatureGate ─────────────────────────────────────

describe("useMultiFeatureGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setupMultiGate(
    features: Record<string, Record<string, unknown>>,
    availabilityMap: Record<string, Record<string, unknown>>,
  ) {
    mockUseFeatureAccess.mockReturnValue({ features });
    mockGetFeatureAvailability.mockImplementation(
      (featureAccess: Record<string, unknown>) => {
        const key = featureAccess?.key as string;
        return makeAvailability(availabilityMap[key] ?? { state: "unlocked" });
      },
    );
  }

  it("returns isAvailable true when all features available (requireAll=true)", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: true }),
        achievements: makeFeatureAccess({ key: "achievements", isUnlocked: true }),
      },
      {
        challenges: { state: "unlocked" },
        achievements: { state: "unlocked" },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges", "achievements"]),
    );
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.availableFeatures).toEqual([
      "challenges",
      "achievements",
    ]);
    expect(result.current.unavailableFeatures).toEqual([]);
  });

  it("returns isAvailable false when one feature is locked (requireAll=true)", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: true }),
        achievements: makeFeatureAccess({
          key: "achievements",
          isUnlocked: false,
        }),
      },
      {
        challenges: { state: "unlocked" },
        achievements: { state: "locked", canRenderEntryPoint: false },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges", "achievements"]),
    );
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.availableFeatures).toEqual(["challenges"]);
    expect(result.current.unavailableFeatures).toEqual(["achievements"]);
  });

  it("returns isAvailable true when any feature available (requireAll=false)", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({
          key: "challenges",
          isUnlocked: false,
        }),
        achievements: makeFeatureAccess({
          key: "achievements",
          isUnlocked: true,
        }),
      },
      {
        challenges: { state: "locked" },
        achievements: { state: "unlocked" },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges", "achievements"], {
        requireAll: false,
      }),
    );
    expect(result.current.isAvailable).toBe(true);
  });

  it("returns isAvailable false when no features available (requireAll=false)", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({
          key: "challenges",
          isUnlocked: false,
        }),
        achievements: makeFeatureAccess({
          key: "achievements",
          isUnlocked: false,
        }),
      },
      {
        challenges: { state: "locked" },
        achievements: { state: "locked" },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges", "achievements"], {
        requireAll: false,
      }),
    );
    expect(result.current.isAvailable).toBe(false);
  });

  it("handles empty feature list (vacuously true for requireAll)", () => {
    setupMultiGate({}, {});
    const { result } = renderHook(() => useMultiFeatureGate([]));
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.featureStates).toEqual([]);
  });

  it("correctly categorizes available and unavailable features", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: true }),
        achievements: makeFeatureAccess({
          key: "achievements",
          isUnlocked: false,
        }),
        rankings: makeFeatureAccess({ key: "rankings", isUnlocked: true }),
      },
      {
        challenges: { state: "unlocked" },
        achievements: { state: "locked" },
        rankings: { state: "unlocked" },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges", "achievements", "rankings"]),
    );
    expect(result.current.availableFeatures).toEqual([
      "challenges",
      "rankings",
    ]);
    expect(result.current.unavailableFeatures).toEqual(["achievements"]);
  });

  it("passes mode option to each feature gate check", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: true }),
      },
      {
        challenges: { state: "unlocked", canRenderEntryPoint: true },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges"], { mode: "entryPoint" }),
    );
    expect(result.current.isAvailable).toBe(true);
    expect(mockGetFeatureAvailability).toHaveBeenCalled();
  });
});

// ── Analytics ──────────────────────────────────────────────────────

describe("feature-gate analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("trackFeatureAccessAttempted", () => {
    it("adds Sentry breadcrumb with feature and accessMethod", () => {
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

    it("includes timestamp in eventBus event", () => {
      trackFeatureAccessAttempted("challenges", "tap");
      expect(eventBus.emit).toHaveBeenCalledWith(
        "feature-gate:access_attempted",
        expect.objectContaining({ timestamp: expect.any(Number) }),
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

    it("passes custom context through", () => {
      trackFeatureAccessAttempted("rankings", "deep_link", {
        from: "notification",
      });
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            context: { from: "notification" },
          }),
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

    it("emits fallbackRoute as undefined when not provided", () => {
      trackFeatureGateBlocked("squads", "hidden");
      expect(eventBus.emit).toHaveBeenCalledWith(
        "feature-gate:blocked",
        expect.objectContaining({ fallbackRoute: undefined }),
      );
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
          timestamp: expect.any(Number),
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

    it("emits eventBus event with all fields", () => {
      trackFeatureVisibilityChanged("challenges", true, false, "archived");
      expect(eventBus.emit).toHaveBeenCalledWith(
        "feature-gate:visibility_changed",
        expect.objectContaining({
          feature: "challenges",
          wasVisible: true,
          isVisible: false,
          reason: "archived",
          timestamp: expect.any(Number),
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

// ── Verification ───────────────────────────────────────────────────

describe("getPhase3VerificationSummary", () => {
  it("returns passed=true when all checks pass", () => {
    const results = [
      {
        feature: "rivals" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(true);
    expect(summary.failedFeatures).toEqual([]);
  });

  it("returns passed=true for empty results", () => {
    const summary = getPhase3VerificationSummary([]);
    expect(summary.passed).toBe(true);
    expect(summary.failedFeatures).toEqual([]);
  });

  it("fails when isHidden is false", () => {
    const results = [
      {
        feature: "rivals" as const,
        isHidden: false,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toContain("rivals");
  });

  it("fails when hasNoTab is false", () => {
    const results = [
      {
        feature: "rankings" as const,
        isHidden: true,
        hasNoTab: false,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toContain("rankings");
  });

  it("fails when hasNoHomeCard is false", () => {
    const results = [
      {
        feature: "wagers" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: false,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
  });

  it("fails when hasNoSettingsEntry is false", () => {
    const results = [
      {
        feature: "gems_prominent" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: false,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
  });

  it("fails when hasSafeFallback is false", () => {
    const results = [
      {
        feature: "squads" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: false,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
  });

  it("fails when analyticsBlocked is false", () => {
    const results = [
      {
        feature: "rivals" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: false,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
  });

  it("collects multiple failed features", () => {
    const results = [
      {
        feature: "rivals" as const,
        isHidden: false,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
      {
        feature: "rankings" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: false,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toEqual(["rivals", "rankings"]);
  });

  it("preserves the results array reference", () => {
    const results = [
      {
        feature: "squads" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.results).toBe(results);
  });
});

// ── Components ─────────────────────────────────────────────────────

describe("FeatureGate component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when feature is available", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { state: "unlocked" },
    );

    const { getByText } = render(
      React.createElement(
        FeatureGate,
        { feature: "challenges" },
        React.createElement(Text, null, "Feature Content"),
      ),
    );
    expect(getByText("Feature Content")).toBeTruthy();
  });

  it("renders fallback when feature is not available", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: false }),
      { state: "locked", canRenderEntryPoint: false },
    );

    const { getByText } = render(
      React.createElement(
        FeatureGate,
        {
          feature: "challenges",
          fallback: React.createElement(Text, null, "Locked Message"),
        },
      ),
    );
    expect(getByText("Locked Message")).toBeTruthy();
  });

  it("renders null when feature not available and no fallback", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: false }),
      { state: "locked" },
    );

    const { toJSON } = render(
      React.createElement(FeatureGate, { feature: "challenges" }),
    );
    expect(toJSON()).toBeNull();
  });

  it("passes mode to useFeatureGate hook", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { state: "unlocked", canNavigate: true, canRegisterRoute: true },
    );

    const { getByText } = render(
      React.createElement(
        FeatureGate,
        { feature: "challenges", mode: "navigation" },
        React.createElement(Text, null, "Content"),
      ),
    );
    expect(getByText("Content")).toBeTruthy();
  });
});

describe("withFeatureGate HOC", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders wrapped component when feature is available", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { state: "unlocked" },
    );

    function TestComponent() {
      return React.createElement(Text, null, "Inner");
    }
    const Wrapped = withFeatureGate("challenges", TestComponent);

    const { getByText } = render(React.createElement(Wrapped));
    expect(getByText("Inner")).toBeTruthy();
  });

  it("renders fallback component when feature is not available", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: false }),
      { state: "locked" },
    );

    function TestComponent() {
      return React.createElement(Text, null, "Inner");
    }
    function FallbackComponent() {
      return React.createElement(Text, null, "Fallback");
    }
    const Wrapped = withFeatureGate("challenges", TestComponent, {
      fallback: FallbackComponent,
    });

    const { getByText } = render(React.createElement(Wrapped));
    expect(getByText("Fallback")).toBeTruthy();
  });

  it("renders null when feature not available and no fallback HOC", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: false }),
      { state: "locked" },
    );

    function TestComponent() {
      return React.createElement(Text, null, "Inner");
    }
    const Wrapped = withFeatureGate("challenges", TestComponent);

    const { toJSON } = render(React.createElement(Wrapped));
    expect(toJSON()).toBeNull();
  });

  it("passes mode option through to FeatureGate", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { state: "unlocked", canRenderEntryPoint: true },
    );

    function TestComponent() {
      return React.createElement(Text, null, "Mode Test");
    }
    const Wrapped = withFeatureGate("challenges", TestComponent, {
      mode: "entryPoint",
    });

    const { getByText } = render(React.createElement(Wrapped));
    expect(getByText("Mode Test")).toBeTruthy();
  });
});

describe("NavigationGate component", () => {
  it("renders the feature not available message", () => {
    const { getByText } = render(
      React.createElement(NavigationGate, {
        featureName: "Duels",
        featureReason: "currently disabled",
      }),
    );
    expect(getByText("Feature Not Available")).toBeTruthy();
    expect(getByText(/Duels is currently disabled/)).toBeTruthy();
  });

  it("renders default suggested action button text", () => {
    const tree = render(
      React.createElement(NavigationGate, {
        featureName: "Duels",
        featureReason: "archived",
      }),
    );
    const treeStr = JSON.stringify(tree.toJSON());
    expect(treeStr).toContain("Return to Home");
  });

  it("renders custom suggested action", () => {
    const tree = render(
      React.createElement(NavigationGate, {
        featureName: "Duels",
        featureReason: "archived",
        suggestedAction: "Go Back",
      }),
    );
    const treeStr = JSON.stringify(tree.toJSON());
    expect(treeStr).toContain("Go Back");
  });

  it("displays feature name in the reason text", () => {
    const { getByText } = render(
      React.createElement(NavigationGate, {
        featureName: "Rankings",
        featureReason: "being redesigned",
      }),
    );
    expect(getByText(/Rankings is being redesigned/)).toBeTruthy();
  });
});
