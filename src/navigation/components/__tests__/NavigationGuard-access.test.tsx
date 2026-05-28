import { describe, it, expect, beforeEach } from "@jest/globals";
import { screen } from "@testing-library/react-native";
import {
  resetFeatureMocks,
  renderGuardedFeature,
  mockIsFeatureEnabled,
  mockIsFeatureDisabled,
  mockIsFeatureOptional,
} from "./test-helpers";

describe("Navigation Guard - Access Control", () => {
  beforeEach(() => {
    resetFeatureMocks();
  });

  describe("Feature Access Control", () => {
    it("should allow navigation to enabled features", () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      renderGuardedFeature("sessions");
      expect(screen.getByTestId("protected-content")).toBeTruthy();
    });
    it("should block navigation to disabled features", () => {
      mockIsFeatureDisabled.mockReturnValue(true);
      renderGuardedFeature("social-feed");
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is currently disabled"),
      ).toBeTruthy();
    });
    it("should show appropriate message for disabled features", () => {
      mockIsFeatureDisabled.mockReturnValue(true);
      renderGuardedFeature("duels");
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is currently disabled"),
      ).toBeTruthy();
      expect(
        screen.getByText("Duels will be available in a future update"),
      ).toBeTruthy();
    });
  });

  describe("Optional Feature Handling", () => {
    it("should allow access to optional features when enabled", () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      renderGuardedFeature("boss");
      expect(screen.getByTestId("protected-content")).toBeTruthy();
    });
    it("should block access to optional features when disabled", () => {
      mockIsFeatureOptional.mockReturnValue(true);
      renderGuardedFeature("challenges");
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is not yet available"),
      ).toBeTruthy();
    });
    it("should show different message for optional features", () => {
      mockIsFeatureOptional.mockReturnValue(true);
      renderGuardedFeature("squads");
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is not yet available"),
      ).toBeTruthy();
      expect(screen.getByText("Squads will be available soon")).toBeTruthy();
    });
  });
});
