jest.mock("../../liveops-config/hooks/useFeatureAccess", () => ({
  useFeatureAccess: jest.fn(),
}));
jest.mock("../../liveops-config/feature-availability", () => ({
  getFeatureAvailability: jest.fn(),
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

import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { FeatureGate, withFeatureGate } from "../FeatureGate";

const { useFeatureAccess: mockUseFeatureAccess } = jest.requireMock(
  "../../liveops-config/hooks/useFeatureAccess",
) as { useFeatureAccess: jest.Mock };
const { getFeatureAvailability: mockGetFeatureAvailability } =
  jest.requireMock("../../liveops-config/feature-availability") as {
    getFeatureAvailability: jest.Mock;
  };

function makeAvailability(overrides: Record<string, unknown> = {}) {
  return { state: "unlocked", canRenderEntryPoint: true, canNavigate: true, canQuery: true, canUseBackend: true, canRegisterRoute: true, canSubscribeToEvents: true, canShowNotification: true, reason: "Unlocked", ...overrides };
}

function makeFeatureAccess(overrides: Record<string, unknown> = {}) {
  return { key: "challenges", isUnlocked: true, isVisible: true, isTeased: false, isDegraded: false, lockedDescription: "Locked feature", recommendedUnlockMoment: "After 5 sessions", unlockReason: "Feature unlocked", releaseState: "final_release_progressive", priority: 10, ...overrides };
}

function setupFeatureGate(featureKey: string, featureAccess: Record<string, unknown>, availability: Record<string, unknown>) {
  mockUseFeatureAccess.mockReturnValue({ features: { [featureKey]: featureAccess } });
  mockGetFeatureAvailability.mockReturnValue(makeAvailability(availability));
}

describe("FeatureGate component", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("renders children when feature is available", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: true }), { state: "unlocked" });
    const { getByText } = render(
      React.createElement(FeatureGate, { feature: "challenges" }, React.createElement(Text, null, "Feature Content")),
    );
    expect(getByText("Feature Content")).toBeTruthy();
  });
  it("renders fallback when feature is not available", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: false }), {
      state: "locked", canRenderEntryPoint: false,
    });
    const { getByText } = render(
      React.createElement(FeatureGate, {
        feature: "challenges",
        fallback: React.createElement(Text, null, "Locked Message"),
      }),
    );
    expect(getByText("Locked Message")).toBeTruthy();
  });
  it("renders null when feature not available and no fallback", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: false }), { state: "locked" });
    const { toJSON } = render(React.createElement(FeatureGate, { feature: "challenges" }));
    expect(toJSON()).toBeNull();
  });
  it("passes mode to useFeatureGate hook", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: true }), {
      state: "unlocked", canNavigate: true, canRegisterRoute: true,
    });
    const { getByText } = render(
      React.createElement(FeatureGate, { feature: "challenges", mode: "navigation" }, React.createElement(Text, null, "Content")),
    );
    expect(getByText("Content")).toBeTruthy();
  });
});

describe("withFeatureGate HOC", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("renders wrapped component when feature is available", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: true }), { state: "unlocked" });
    function TestComponent() { return React.createElement(Text, null, "Inner"); }
    const Wrapped = withFeatureGate("challenges", TestComponent);
    const { getByText } = render(React.createElement(Wrapped));
    expect(getByText("Inner")).toBeTruthy();
  });
  it("renders fallback component when feature is not available", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: false }), { state: "locked" });
    function TestComponent() { return React.createElement(Text, null, "Inner"); }
    function FallbackComponent() { return React.createElement(Text, null, "Fallback"); }
    const Wrapped = withFeatureGate("challenges", TestComponent, { fallback: FallbackComponent });
    const { getByText } = render(React.createElement(Wrapped));
    expect(getByText("Fallback")).toBeTruthy();
  });
  it("renders null when feature not available and no fallback HOC", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: false }), { state: "locked" });
    function TestComponent() { return React.createElement(Text, null, "Inner"); }
    const Wrapped = withFeatureGate("challenges", TestComponent);
    const { toJSON } = render(React.createElement(Wrapped));
    expect(toJSON()).toBeNull();
  });
  it("passes mode option through to FeatureGate", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: true }), {
      state: "unlocked", canRenderEntryPoint: true,
    });
    function TestComponent() { return React.createElement(Text, null, "Mode Test"); }
    const Wrapped = withFeatureGate("challenges", TestComponent, { mode: "entryPoint" });
    const { getByText } = render(React.createElement(Wrapped));
    expect(getByText("Mode Test")).toBeTruthy();
  });
});
