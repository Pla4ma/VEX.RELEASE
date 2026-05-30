import { resolveBoss } from "../experience-resolvers";
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

describe("resolveBoss", () => {
  it("is not visible when availability.boss is false", () => {
    const boss = resolveBoss({
      availability: { ...fixtures.available, boss: false },
      profile: fixtures.profile("game_like"),
      stats: makeStats({ totalCompletedSessions: 5, bossChallengeEngagement: "medium" }),
    });
    expect(boss.isVisible).toBe(false);
  });
  it("is not visible when sessions < 3", () => {
    const boss = resolveBoss({
      availability: fixtures.available,
      profile: fixtures.profile("game_like"),
      stats: makeStats({ totalCompletedSessions: 2, bossChallengeEngagement: "medium" }),
    });
    expect(boss.isVisible).toBe(false);
  });
  it("is not visible when engagement is none", () => {
    const boss = resolveBoss({
      availability: fixtures.available,
      profile: fixtures.profile("game_like"),
      stats: makeStats({ totalCompletedSessions: 5, bossChallengeEngagement: "none" }),
    });
    expect(boss.isVisible).toBe(false);
  });
  it("is visible when all conditions met", () => {
    const boss = resolveBoss({
      availability: fixtures.available,
      profile: fixtures.profile("game_like"),
      stats: makeStats({ totalCompletedSessions: 5, bossChallengeEngagement: "medium" }),
    });
    expect(boss.isVisible).toBe(true);
    expect(boss.progressSource).toBe("completed_focus_sessions");
  });
  it("hides homePlacement when not visible", () => {
    const boss = resolveBoss({
      availability: { ...fixtures.available, boss: false },
      profile: fixtures.profile("calm"),
      stats: makeStats(),
    });
    expect(boss.homePlacement).toBe("hidden");
  });
});
