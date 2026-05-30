jest.mock("../../liveops-config/hooks/useFeatureAccess", () => ({
  useFeatureAccess: jest.fn(),
}));
jest.mock("../../liveops-config/feature-availability", () => ({
  getFeatureAvailability: jest.fn(),
}));

import { useMultiFeatureGate } from "../hooks";
import { renderHook } from "@testing-library/react-native";

const { useFeatureAccess: mockUseFeatureAccess } = jest.requireMock("../../liveops-config/hooks/useFeatureAccess") as { useFeatureAccess: jest.Mock };
const { getFeatureAvailability: mockGetFeatureAvailability } = jest.requireMock("../../liveops-config/feature-availability") as { getFeatureAvailability: jest.Mock };

function makeAvailability(overrides: Record<string, unknown> = {}) {
  return { state: "unlocked", canRenderEntryPoint: true, canNavigate: true, canQuery: true, canUseBackend: true, canRegisterRoute: true, canSubscribeToEvents: true, canShowNotification: true, reason: "Unlocked", ...overrides };
}

function makeFeatureAccess(overrides: Record<string, unknown> = {}) {
  return { key: "challenges", isUnlocked: true, isVisible: true, isTeased: false, isDegraded: false, lockedDescription: "Locked feature", recommendedUnlockMoment: "After 5 sessions", unlockReason: "Feature unlocked", releaseState: "final_release_progressive", priority: 10, ...overrides };
}

describe("useMultiFeatureGate", () => {
  beforeEach(() => { jest.clearAllMocks(); });

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
      { challenges: { state: "unlocked" }, achievements: { state: "unlocked" } },
    );
    const { result } = renderHook(() => useMultiFeatureGate(["challenges", "achievements"]));
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.availableFeatures).toEqual(["challenges", "achievements"]);
    expect(result.current.unavailableFeatures).toEqual([]);
  });
  it("returns isAvailable false when one feature is locked (requireAll=true)", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: true }),
        achievements: makeFeatureAccess({ key: "achievements", isUnlocked: false }),
      },
      { challenges: { state: "unlocked" }, achievements: { state: "locked", canRenderEntryPoint: false } },
    );
    const { result } = renderHook(() => useMultiFeatureGate(["challenges", "achievements"]));
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
      { challenges: { state: "locked" }, achievements: { state: "unlocked" } },
    );
    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges", "achievements"], { requireAll: false }),
    );
    expect(result.current.isAvailable).toBe(true);
  });
  it("returns isAvailable false when no features available (requireAll=false)", () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: "challenges", isUnlocked: false }),
        achievements: makeFeatureAccess({ key: "achievements", isUnlocked: false }),
      },
      { challenges: { state: "locked" }, achievements: { state: "locked" } },
    );
    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges", "achievements"], { requireAll: false }),
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
        achievements: makeFeatureAccess({ key: "achievements", isUnlocked: false }),
        rankings: makeFeatureAccess({ key: "rankings", isUnlocked: true }),
      },
      { challenges: { state: "unlocked" }, achievements: { state: "locked" }, rankings: { state: "unlocked" } },
    );
    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges", "achievements", "rankings"]),
    );
    expect(result.current.availableFeatures).toEqual(["challenges", "rankings"]);
    expect(result.current.unavailableFeatures).toEqual(["achievements"]);
  });
  it("passes mode option to each feature gate check", () => {
    setupMultiGate(
      { challenges: makeFeatureAccess({ key: "challenges", isUnlocked: true }) },
      { challenges: { state: "unlocked", canRenderEntryPoint: true } },
    );
    const { result } = renderHook(() =>
      useMultiFeatureGate(["challenges"], { mode: "entryPoint" }),
    );
    expect(result.current.isAvailable).toBe(true);
    expect(mockGetFeatureAvailability).toHaveBeenCalled();
  });
});
