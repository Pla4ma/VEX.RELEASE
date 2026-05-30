import { resolveBossIntensity } from "../experience-resolvers";
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

describe("resolveBossIntensity", () => {
  it("returns 'subtle' when engagement is none", () => {
    expect(
      resolveBossIntensity(fixtures.profile("calm"), makeStats({ bossChallengeEngagement: "none" })),
    ).toBe("subtle");
  });
  it("returns 'game-like' for game_like motivation", () => {
    expect(
      resolveBossIntensity(
        fixtures.profile("game_like"),
        makeStats({ bossChallengeEngagement: "medium" }),
      ),
    ).toBe("game-like");
  });
  it("returns 'intense' for intense motivation", () => {
    expect(
      resolveBossIntensity(
        fixtures.profile("intense"),
        makeStats({ bossChallengeEngagement: "high" }),
      ),
    ).toBe("intense");
  });
  it("returns 'standard' as default", () => {
    expect(
      resolveBossIntensity(
        fixtures.profile("friendly"),
        makeStats({ bossChallengeEngagement: "medium" }),
      ),
    ).toBe("standard");
  });
});
