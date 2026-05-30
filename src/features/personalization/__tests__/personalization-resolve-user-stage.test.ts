import { resolveUserStage } from "../experience-resolvers";
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

describe("resolveUserStage", () => {
  it("returns 'new_user' for 0 sessions", () => {
    expect(resolveUserStage(makeStats({ totalCompletedSessions: 0 }))).toBe("new_user");
  });
  it("returns 'activating' for 1-2 sessions", () => {
    expect(resolveUserStage(makeStats({ totalCompletedSessions: 1 }))).toBe("activating");
    expect(resolveUserStage(makeStats({ totalCompletedSessions: 2 }))).toBe("activating");
  });
  it("returns 'engaged' for 3-9 sessions", () => {
    expect(resolveUserStage(makeStats({ totalCompletedSessions: 3 }))).toBe("engaged");
    expect(resolveUserStage(makeStats({ totalCompletedSessions: 9 }))).toBe("engaged");
  });
  it("returns 'power_user' for 10+ sessions", () => {
    expect(resolveUserStage(makeStats({ totalCompletedSessions: 10 }))).toBe("power_user");
    expect(resolveUserStage(makeStats({ totalCompletedSessions: 100 }))).toBe("power_user");
  });
});
