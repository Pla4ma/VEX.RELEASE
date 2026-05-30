import { resolveVexExperience, trackVexExperienceResolved } from "../index";
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

describe("trackVexExperienceResolved", () => {
  it("calls Sentry.addBreadcrumb with experience data", () => {
    const Sentry = require("@sentry/react-native");
    const exp = resolveVexExperience(
      fixtures.profile("calm"),
      makeStats(),
      fixtures.unavailable,
    );
    trackVexExperienceResolved(exp);
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "personalization",
        message: "Resolved VEX experience",
      }),
    );
  });
});
