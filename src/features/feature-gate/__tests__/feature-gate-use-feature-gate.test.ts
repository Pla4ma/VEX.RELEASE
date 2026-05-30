jest.mock("../../liveops-config/hooks/useFeatureAccess", () => ({
  useFeatureAccess: jest.fn(),
}));
jest.mock("../../liveops-config/feature-availability", () => ({
  getFeatureAvailability: jest.fn(),
}));

import { useFeatureGate } from "../hooks";
import { renderHook } from "@testing-library/react-native";

const { useFeatureAccess: mockUseFeatureAccess } = jest.requireMock("../../liveops-config/hooks/useFeatureAccess") as { useFeatureAccess: jest.Mock };
const { getFeatureAvailability: mockGetFeatureAvailability } = jest.requireMock("../../liveops-config/feature-availability") as { getFeatureAvailability: jest.Mock };

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

describe("useFeatureGate", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("returns isAvailable true for unlocked features (default mode)", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: true }), { state: "unlocked" });
    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isUnlocked).toBe(true);
    expect(result.current.isDegraded).toBe(false);
  });
  it("returns isAvailable false for locked features", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: false }), {
      state: "locked", canRenderEntryPoint: false, canNavigate: false, canQuery: false,
    });
    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isUnlocked).toBe(false);
  });
  it("returns isDegraded true for degraded features", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isUnlocked: true, isDegraded: true }), { state: "degraded" });
    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.isDegraded).toBe(true);
    expect(result.current.isAvailable).toBe(true);
  });
  it("entryPoint mode checks canRenderEntryPoint (true)", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canRenderEntryPoint: true });
    const { result } = renderHook(() => useFeatureGate("challenges", "entryPoint"));
    expect(result.current.isAvailable).toBe(true);
  });
  it("entryPoint mode checks canRenderEntryPoint (false)", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canRenderEntryPoint: false });
    const { result } = renderHook(() => useFeatureGate("challenges", "entryPoint"));
    expect(result.current.isAvailable).toBe(false);
  });
  it("navigation mode requires both canNavigate and canRegisterRoute", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canNavigate: true, canRegisterRoute: true });
    const { result } = renderHook(() => useFeatureGate("challenges", "navigation"));
    expect(result.current.isAvailable).toBe(true);
  });
  it("navigation mode fails if canNavigate is false", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canNavigate: false, canRegisterRoute: true });
    const { result } = renderHook(() => useFeatureGate("challenges", "navigation"));
    expect(result.current.isAvailable).toBe(false);
  });
  it("navigation mode fails if canRegisterRoute is false", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canNavigate: true, canRegisterRoute: false });
    const { result } = renderHook(() => useFeatureGate("challenges", "navigation"));
    expect(result.current.isAvailable).toBe(false);
  });
  it("query mode requires both canQuery and canUseBackend", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canQuery: true, canUseBackend: true });
    const { result } = renderHook(() => useFeatureGate("challenges", "query"));
    expect(result.current.isAvailable).toBe(true);
  });
  it("query mode fails if canQuery is false", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canQuery: false, canUseBackend: true });
    const { result } = renderHook(() => useFeatureGate("challenges", "query"));
    expect(result.current.isAvailable).toBe(false);
  });
  it("route mode checks canRegisterRoute", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canRegisterRoute: true });
    const { result } = renderHook(() => useFeatureGate("challenges", "route"));
    expect(result.current.isAvailable).toBe(true);
  });
  it("event mode checks canSubscribeToEvents", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canSubscribeToEvents: false });
    const { result } = renderHook(() => useFeatureGate("challenges", "event"));
    expect(result.current.isAvailable).toBe(false);
  });
  it("notification mode checks canShowNotification", () => {
    setupFeatureGate("challenges", makeFeatureAccess(), { canShowNotification: true });
    const { result } = renderHook(() => useFeatureGate("challenges", "notification"));
    expect(result.current.isAvailable).toBe(true);
  });
  it("exposes lockedDescription, unlockReason, recommendedUnlockMoment", () => {
    setupFeatureGate("challenges", makeFeatureAccess({
      isUnlocked: false, lockedDescription: "Complete 5 sessions",
      unlockReason: "Feature now available", recommendedUnlockMoment: "After day 3",
    }), { state: "locked" });
    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.lockedDescription).toBe("Complete 5 sessions");
    expect(result.current.unlockReason).toBe("Feature now available");
    expect(result.current.recommendedUnlockMoment).toBe("After day 3");
  });
  it("exposes isVisible from featureAccess", () => {
    setupFeatureGate("challenges", makeFeatureAccess({ isVisible: false }), { state: "locked" });
    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.isVisible).toBe(false);
  });
  it("availability object is passed through", () => {
    const availability = makeAvailability({ state: "unlocked", reason: "test" });
    mockUseFeatureAccess.mockReturnValue({ features: { challenges: makeFeatureAccess() } });
    mockGetFeatureAvailability.mockReturnValue(availability);
    const { result } = renderHook(() => useFeatureGate("challenges"));
    expect(result.current.availability).toEqual(availability);
  });
});
