import {
  countByType,
  countDistinctSurfaces,
  hasMinimumSignals,
  hasSurfacesDismissedMultipleTimes,
  hasSurfacesClickedMultipleTimes,
  DISMISS_THRESHOLD,
  CLICK_TO_REINFORCE_THRESHOLD,
} from "../behavior-resolver-helpers";

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe("behavior-resolver-helpers", () => {
  const makeSignal = (type: string, surfaceKey = "test_surface") => ({
    userId: "00000000-0000-0000-0000-000000000001",
    surfaceKey,
    signalType: type as any,
    source: "home_hero" as any,
    timestamp: Date.now(),
  });

  it("countByType counts matching signals", () => {
    const signals = [
      makeSignal("surface_clicked"),
      makeSignal("surface_clicked"),
      makeSignal("surface_dismissed"),
    ];
    expect(countByType(signals as any, "surface_clicked")).toBe(2);
  });
  it("countDistinctSurfaces returns unique surfaces", () => {
    const signals = [
      makeSignal("surface_clicked", "a"),
      makeSignal("surface_clicked", "b"),
      makeSignal("surface_clicked", "a"),
    ];
    const result = countDistinctSurfaces(signals as any, "surface_clicked");
    expect(result.size).toBe(2);
  });
  it("hasMinimumSignals returns true when threshold met", () => {
    const signals = [makeSignal("boss_cta_clicked"), makeSignal("boss_cta_clicked")];
    expect(hasMinimumSignals(signals as any, "boss_cta_clicked", 2)).toBe(true);
  });
  it("hasSurfacesDismissedMultipleTimes surfaces meeting threshold", () => {
    const signals = Array.from({ length: DISMISS_THRESHOLD }, () =>
      makeSignal("surface_dismissed", "annoying_surface"),
    );
    expect(hasSurfacesDismissedMultipleTimes(signals as any)).toContain("annoying_surface");
  });
  it("hasSurfacesClickedMultipleTimes surfaces meeting threshold", () => {
    const signals = Array.from({ length: CLICK_TO_REINFORCE_THRESHOLD }, () =>
      makeSignal("surface_clicked", "liked_surface"),
    );
    expect(hasSurfacesClickedMultipleTimes(signals as any)).toContain("liked_surface");
  });
});
