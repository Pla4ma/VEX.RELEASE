import { resolveCompanionIntensity } from "../experience-resolvers";
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

describe("resolveCompanionIntensity", () => {
  it("returns 'active' for strong gamification", () => {
    expect(resolveCompanionIntensity(fixtures.profile("game_like"))).toBe("active");
  });
  it("returns 'present' for medium gamification", () => {
    expect(
      resolveCompanionIntensity(
        fixtures.profile("friendly", { gamificationIntensity: "medium" }),
      ),
    ).toBe("present");
  });
  it("returns 'subtle' for calm motivation", () => {
    expect(resolveCompanionIntensity(fixtures.profile("calm"))).toBe("subtle");
  });
});
