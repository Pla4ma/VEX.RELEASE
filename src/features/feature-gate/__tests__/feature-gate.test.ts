/**
 * Tests for the feature-gate feature
 * Covers: hooks (useFeatureGate, useMultiFeatureGate),
 *         analytics (trackFeatureAccessAttempted, trackFeatureGateBlocked,
 *                    trackFeatureGateAllowed, trackFeatureVisibilityChanged),
 *         verification (getPhase3VerificationSummary),
 *         components (FeatureGate, withFeatureGate, GatedScreen, NavigationGate)
 */

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

// Mock useFeatureAccess — the hooks.ts file imports from this path
// and this file re-exports from liveops-config/index. We mock the re-export file.
jest.mock("../../liveops-config/hooks/useFeatureAccess", () => ({
  useFeatureAccess: jest.fn(),
}));

// Mock getFeatureAvailability
jest.mock("../../liveops-config/feature-availability", () => ({
  getFeatureAvailability: jest.fn(),
}));

// Mock react-navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

// Mock theme
jest.mock("../../../theme", () => ({
  useTheme: () => ({
    theme: {
      colors: { background: { primary: "#000" }, text: { primary: "#fff", secondary: "#aaa" } },
      spacing: { 4: 16 },
    },
  }),
}));

// Mock primitives
jest.mock("../../../components/primitives/Box", () => ({
  Box: "View",
}));
jest.mock("../../../components/primitives/Text", () => ({
  Text: "Text",
}));
jest.mock("../../../components/primitives/Button", () => ({
  Button: "Button",
}));

jest.mock("../../../theme/tokens/sizing", () => ({
  sizing: { width: { xl: 400 }, icon: { "2xl": 32 } },
}));

// ── Imports after mocks ────────────────────────────────────────────

import { useFeatureGate, useMultiFeatureGate } from "../hooks";
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

// Get references to the mocked functions
const { useFeatureAccess: mockUseFeatureAccess } = jest.requireMock(
  "../../liveops-config/hooks/useFeatureAccess",
) as { useFeatureAccess: jest.Mock };
const { getFeatureAvailability: mockGetFeatureAvailability } = jest.requireMock(
  "../../liveops-config/feature-availability",
) as { getFeatureAvailability: jest.Mock };
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

  it("returns isAvailable true for unlocked features", () => {
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
      { state: "locked", canRenderEntryPoint: false, canNavigate: false, canQuery: false },
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
    // Default mode: state === 'unlocked' || state === 'degraded'
    expect(result.current.isAvailable).toBe(true);
  });

  it("checks entryPoint mode against canRenderEntryPoint", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { canRenderEntryPoint: true },
    );

    const { result } = renderHook(() =>
      useFeatureGate("challenges", "entryPoint"),
    );
    expect(result.current.isAvailable).toBe(true);
    expect(mockGetFeatureAvailability).toHaveBeenCalled();
  });

  it("returns false for navigation mode when canNavigate is false", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true, isDegraded: true }),
      { canNavigate: false, canRegisterRoute: true },
    );

    const { result } = renderHook(() =>
      useFeatureGate("challenges", "navigation"),
    );
    expect(result.current.isAvailable).toBe(false);
  });

  it("returns true for navigation mode when both canNavigate and canRegisterRoute", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { canNavigate: true, canRegisterRoute: true },
    );

    const { result } = renderHook(() =>
      useFeatureGate("challenges", "navigation"),
    );
    expect(result.current.isAvailable).toBe(true);
  });

  it("returns true for query mode when canQuery and canUseBackend", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { canQuery: true, canUseBackend: true },
    );

    const { result } = renderHook(() => useFeatureGate("challenges", "query"));
    expect(result.current.isAvailable).toBe(true);
  });

  it("returns false for query mode when canUseBackend is false", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true, isDegraded: true }),
      { canQuery: false, canUseBackend: false },
    );

    const { result } = renderHook(() => useFeatureGate("challenges", "query"));
    expect(result.current.isAvailable).toBe(false);
  });

  it("checks route mode against canRegisterRoute", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true, isDegraded: true }),
      { canRegisterRoute: true },
    );

    const { result } = renderHook(() => useFeatureGate("challenges", "route"));
    expect(result.current.isAvailable).toBe(true);
  });

  it("checks event mode against canSubscribeToEvents", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true, isDegraded: true }),
      { canSubscribeToEvents: false },
    );

    const { result } = renderHook(() => useFeatureGate("challenges", "event"));
    expect(result.current.isAvailable).toBe(false);
  });

  it("checks notification mode against canShowNotification", () => {
    setupFeatureGate(
      "challenges",
      makeFeatureAccess({ isUnlocked: true }),
      { canShowNotification: true },
    );

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
        achievements: makeFeatureAccess({ key: "achievements", isUnlocked: false }),
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
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: false }),
        achievements: makeFeatureAccess({ key: "achievements", isUnlocked: true }),
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
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: false }),
        achievements: makeFeatureAccess({ key: "achievements", isUnlocked: false }),
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

  it("handles empty feature list", () => {
    setupMultiGate({}, {});

    const { result } = renderHook(() => useMultiFeatureGate([]));
    // [].every(...) === true (vacuously true)
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.featureStates).toEqual([]);
  });

  it("correctly categorizes available and unavailable features", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: true }),
        achievements: makeFeatureAccess({ key: "achievements", isUnlocked: false }),
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
    expect(result.current.availableFeatures).toEqual(["challenges", "rankings"]);
    expect(result.current.unavailableFeatures).toEqual(["achievements"]);
  });
});

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

  it("returns passed=false when isHidden is false", () => {
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

  it("returns passed=false when hasNoTab fails", () => {
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

  it("returns passed=true for empty results", () => {
    const summary = getPhase3VerificationSummary([]);
    expect(summary.passed).toBe(true);
    expect(summary.failedFeatures).toEqual([]);
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
      React.createElement(FeatureGate, { feature: "challenges" },
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
      React.createElement(FeatureGate, {
        feature: "challenges",
        fallback: React.createElement(Text, null, "Locked Message"),
      }),
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
      return React.createElement("span", null, "Inner");
    }
    const Wrapped = withFeatureGate("challenges", TestComponent);

    const { toJSON } = render(React.createElement(Wrapped));
    expect(toJSON()).toBeNull();
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

  it("renders default suggested action button", () => {
    const tree = render(
      React.createElement(NavigationGate, {
        featureName: "Duels",
        featureReason: "archived",
      }),
    );
    // The default action is "Return to Home"
    const json = tree.toJSON();
    const treeStr = JSON.stringify(json);
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
});
