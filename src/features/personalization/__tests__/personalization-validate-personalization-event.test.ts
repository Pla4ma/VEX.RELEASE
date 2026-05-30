import { validatePersonalizationEvent } from "../index";

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

describe("validatePersonalizationEvent", () => {
  it("validates a valid motivation-style-changed event", () => {
    const event = validatePersonalizationEvent({
      type: "personalization:motivation-style-changed",
      motivationStyle: "calm",
      timestamp: Date.now(),
    });
    expect(event.type).toBe("personalization:motivation-style-changed");
  });
  it("validates a reset-requested event", () => {
    const event = validatePersonalizationEvent({
      type: "personalization:reset-requested",
      timestamp: Date.now(),
    });
    expect(event.type).toBe("personalization:reset-requested");
  });
  it("throws for invalid motivation style", () => {
    expect(() =>
      validatePersonalizationEvent({
        type: "personalization:motivation-style-changed",
        motivationStyle: "invalid_style",
        timestamp: Date.now(),
      } as any),
    ).toThrow();
  });
});
