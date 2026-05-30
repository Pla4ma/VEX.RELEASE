import { resolvePremium } from "../experience-service-helpers";
import { makeStats } from "./personalization.helpers";
import * as fixtures from "./test-fixtures";

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

describe("resolvePremium", () => {
  it("shouldTease false when < 5 sessions", () => {
    const result = resolvePremium(fixtures.available, makeStats({ totalCompletedSessions: 3 }));
    expect(result.shouldTease).toBe(false);
  });
  it("shouldTease true when available + 5+ sessions + has attempts", () => {
    const result = resolvePremium(
      fixtures.available,
      makeStats({
        totalCompletedSessions: 10,
        premiumFeatureAttempts: ["advanced_study"],
      }),
    );
    expect(result.shouldTease).toBe(true);
  });
  it("trigger is advanced_study when attempted", () => {
    const result = resolvePremium(
      fixtures.available,
      makeStats({
        totalCompletedSessions: 10,
        premiumFeatureAttempts: ["advanced_study"],
      }),
    );
    expect(result.trigger).toBe("advanced_study");
  });
  it("mustRemainFree includes free execution loop", () => {
    const result = resolvePremium(fixtures.available, makeStats());
    expect(result.mustRemainFree).toContain("start_session");
    expect(result.mustRemainFree).toContain("complete_session");
  });
});
