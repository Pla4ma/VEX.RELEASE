import { resolvePremiumMoment } from "../experience-resolvers";
import { makeStats } from "./personalization.helpers";

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

describe("resolvePremiumMoment", () => {
  it("returns 'none' for < 5 sessions", () => {
    expect(
      resolvePremiumMoment(makeStats({ totalCompletedSessions: 3 })),
    ).toBe("none");
  });
  it("returns 'advanced_study' when user tried advanced_study", () => {
    expect(
      resolvePremiumMoment(
        makeStats({
          totalCompletedSessions: 10,
          premiumFeatureAttempts: ["advanced_study"],
        }),
      ),
    ).toBe("advanced_study");
  });
  it("returns 'weekly_intelligence' when tried weekly_intelligence", () => {
    expect(
      resolvePremiumMoment(
        makeStats({
          totalCompletedSessions: 10,
          premiumFeatureAttempts: ["weekly_intelligence"],
        }),
      ),
    ).toBe("weekly_intelligence");
  });
  it("returns 'session_value' for 10+ sessions with no specific attempt", () => {
    expect(
      resolvePremiumMoment(
        makeStats({ totalCompletedSessions: 10, premiumFeatureAttempts: ["unknown"] }),
      ),
    ).toBe("session_value");
  });
});
