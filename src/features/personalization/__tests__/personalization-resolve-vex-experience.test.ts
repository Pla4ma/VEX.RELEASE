import { resolveVexExperience } from "../index";
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

describe("resolveVexExperience", () => {
  it("returns version 3 experience for new user", () => {
    const exp = resolveVexExperience(
      fixtures.profile("calm"),
      makeStats(),
      fixtures.unavailable,
    );
    expect(exp.version).toBe(3);
    expect(exp.userStage).toBe("new_user");
  });
  it("returns power_user stage for engaged user", () => {
    const exp = resolveVexExperience(
      fixtures.profile("game_like"),
      makeStats({ totalCompletedSessions: 15 }),
      fixtures.available,
    );
    expect(exp.userStage).toBe("power_user");
  });
  it("uses START_SESSION intent for non-study users", () => {
    const exp = resolveVexExperience(
      fixtures.profile("calm"),
      makeStats(),
      fixtures.unavailable,
    );
    expect(exp.primaryHomeCTA.intent).toBe("START_SESSION");
  });
  it("sets progress emphasis to basic for < 2 sessions", () => {
    const exp = resolveVexExperience(
      fixtures.profile("calm"),
      makeStats({ totalCompletedSessions: 0 }),
      fixtures.unavailable,
    );
    expect(exp.progressEmphasis).toBe("basic");
  });
  it("sets progress emphasis to rhythm for 2-6 sessions", () => {
    const exp = resolveVexExperience(
      fixtures.profile("calm"),
      makeStats({ totalCompletedSessions: 3 }),
      fixtures.unavailable,
    );
    expect(exp.progressEmphasis).toBe("rhythm");
  });
  it("sets progress emphasis to intelligence for 7+ sessions", () => {
    const exp = resolveVexExperience(
      fixtures.profile("calm"),
      makeStats({ totalCompletedSessions: 7 }),
      fixtures.unavailable,
    );
    expect(exp.progressEmphasis).toBe("intelligence");
  });
  it("bans gamification surfaces for calm motivation", () => {
    const exp = resolveVexExperience(
      fixtures.profile("calm"),
      makeStats(),
      fixtures.unavailable,
    );
    expect(exp.bannedSurfaces).toContain("boss_full_cta");
  });
  it("includes study continuation in allowed notifications when study available", () => {
    const exp = resolveVexExperience(
      fixtures.profile("study_focused"),
      makeStats(),
      { ...fixtures.available, study: true },
    );
    expect(exp.allowedNotificationTypes).toContain("study_continuation");
  });
  it("routeGates boss canNavigate is false when boss not visible", () => {
    const exp = resolveVexExperience(
      fixtures.profile("calm"),
      makeStats(),
      fixtures.unavailable,
    );
    expect(exp.routeGates.boss.canNavigate).toBe(false);
  });
});
