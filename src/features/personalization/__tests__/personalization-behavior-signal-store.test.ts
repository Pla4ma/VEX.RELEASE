import {
  recordBehaviorSignal,
  getBehaviorSignals,
  clearBehaviorSignals,
} from "../index";

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

describe("behavior-signal-store", () => {
  it("recordBehaviorSignal does not throw", () => {
    expect(() =>
      recordBehaviorSignal(
        "00000000-0000-0000-0000-000000000001",
        "surface_clicked",
        "test_surface",
        "home_hero",
      ),
    ).not.toThrow();
  });
  it("getBehaviorSignals returns array (may be empty with mock storage)", () => {
    const signals = getBehaviorSignals("00000000-0000-0000-0000-000000000001");
    expect(Array.isArray(signals)).toBe(true);
  });
  it("clearBehaviorSignals does not throw", () => {
    expect(() =>
      clearBehaviorSignals("00000000-0000-0000-0000-000000000001"),
    ).not.toThrow();
  });
});
