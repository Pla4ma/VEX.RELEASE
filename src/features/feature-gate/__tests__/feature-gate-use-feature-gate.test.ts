// ── Mocks ──────────────────────────────────────────────────────────

jest.mock("../../liveops-config/hooks/useFeatureAccess", () => ({
  useFeatureAccess: jest.fn(),
}));

jest.mock("../../liveops-config/feature-availability", () => ({
  getFeatureAvailability: jest.fn(),
}));

// ── Imports after mocks ────────────────────────────────────────────

import { useFeatureGate } from "../hooks";
import { renderHook } from "@testing-library/react-native";
import { createTestHelpers } from "./_helpers";

const { useFeatureAccess: mockUseFeatureAccess } = jest.requireMock(
  "../../liveops-config/hooks/useFeatureAccess",
) as { useFeatureAccess: jest.Mock };
const { getFeatureAvailability: mockGetFeatureAvailability } = jest.requireMock(
  "../../liveops-config/feature-availability",
) as { getFeatureAvailability: jest.Mock };

const { makeAvailability, makeFeatureAccess, setupFeatureGate } =
  createTestHelpers(mockUseFeatureAccess, mockGetFeatureAvailability);

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
