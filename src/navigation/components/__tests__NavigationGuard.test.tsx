import React from "react";
import { View, Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { NavigationGuard } from "./NavigationGuard";
import {
  isFeatureEnabled,
  isFeatureDisabled,
  isFeatureOptional,
  getDisabledFeatures,
} from "../../constants/features";
const mockIsFeatureEnabled = jest.fn();
const mockIsFeatureDisabled = jest.fn();
const mockIsFeatureOptional = jest.fn();
const mockGetDisabledFeatures = jest.fn(() => [
  "social-feed",
  "duels",
  "rankings",
  "squad-wars",
  "rivals",
  "trading",
  "emergency-gem-sinks",
  "complex-crafting",
  "ar-experimental",
]);
jest.mock("../../constants/features", () => ({
  isFeatureEnabled: mockIsFeatureEnabled,
  isFeatureDisabled: mockIsFeatureDisabled,
  isFeatureOptional: mockIsFeatureOptional,
  getDisabledFeatures: mockGetDisabledFeatures,
}));
describe("Navigation Guard - PHASE 8 Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFeatureEnabled.mockReturnValue(false);
    mockIsFeatureDisabled.mockReturnValue(false);
    mockIsFeatureOptional.mockReturnValue(false);
  });
  describe("Feature Access Control", () => {
    it("should allow navigation to enabled features", () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      mockIsFeatureDisabled.mockReturnValue(false);
      mockIsFeatureOptional.mockReturnValue(false);
      const TestComponent = () => (
        <NavigationGuard feature="sessions">
          <View testID="protected-content">
            <Text>Session Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
      expect(screen.getByTestId("protected-content")).toBeTruthy();
    });
    it("should block navigation to disabled features", () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      mockIsFeatureDisabled.mockReturnValue(true);
      mockIsFeatureOptional.mockReturnValue(false);
      const TestComponent = () => (
        <NavigationGuard feature="social-feed">
          <View testID="protected-content">
            <Text>Social Feed Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is currently disabled"),
      ).toBeTruthy();
    });
    it("should show appropriate message for disabled features", () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      mockIsFeatureDisabled.mockReturnValue(true);
      mockIsFeatureOptional.mockReturnValue(false);
      const TestComponent = () => (
        <NavigationGuard feature="duels">
          <View testID="protected-content">
            <Text>Duels Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
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
      mockIsFeatureDisabled.mockReturnValue(false);
      mockIsFeatureOptional.mockReturnValue(false);
      const TestComponent = () => (
        <NavigationGuard feature="boss">
          <View testID="protected-content">
            <Text>Boss Battle Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
      expect(screen.getByTestId("protected-content")).toBeTruthy();
    });
    it("should block access to optional features when disabled", () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      mockIsFeatureDisabled.mockReturnValue(false);
      mockIsFeatureOptional.mockReturnValue(true);
      const TestComponent = () => (
        <NavigationGuard feature="challenges">
          <View testID="protected-content">
            <Text>Challenges Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is not yet available"),
      ).toBeTruthy();
    });
    it("should show different message for optional features", () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      mockIsFeatureDisabled.mockReturnValue(false);
      mockIsFeatureOptional.mockReturnValue(true);
      const TestComponent = () => (
        <NavigationGuard feature="squads">
          <View testID="protected-content">
            <Text>Squads Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is not yet available"),
      ).toBeTruthy();
      expect(screen.getByText("Squads will be available soon")).toBeTruthy();
    });
  });
  describe("Disabled Features Verification", () => {
    it("should block all explicitly disabled features", () => {
      const disabledFeatures = mockGetDisabledFeatures();
      disabledFeatures.forEach((feature: string) => {
        mockIsFeatureEnabled.mockReturnValue(false);
        mockIsFeatureDisabled.mockReturnValue(true);
        mockIsFeatureOptional.mockReturnValue(false);
        const TestComponent = () => (
          <NavigationGuard feature={feature}>
            <View testID="protected-content">
              <Text>{feature} Content</Text>
            </View>
          </NavigationGuard>
        );
        render(
          <NavigationContainer>
            <TestComponent />
          </NavigationContainer>,
        );
        expect(screen.queryByTestId("protected-content")).toBeFalsy();
        expect(
          screen.getByText("This feature is currently disabled"),
        ).toBeTruthy();
      });
    });
    it("should verify banned features are properly blocked", () => {
      const bannedFeatures = [
        "social-feed",
        "duels",
        "rankings",
        "squad-wars",
        "rivals",
        "trading",
      ];
      bannedFeatures.forEach((feature: string) => {
        mockIsFeatureEnabled.mockReturnValue(false);
        mockIsFeatureDisabled.mockReturnValue(true);
        mockIsFeatureOptional.mockReturnValue(false);
        const TestComponent = () => (
          <NavigationGuard feature={feature}>
            <View testID="protected-content">
              <Text>{feature} Content</Text>
            </View>
          </NavigationGuard>
        );
        render(
          <NavigationContainer>
            <TestComponent />
          </NavigationContainer>,
        );
        expect(screen.queryByTestId("protected-content")).toBeFalsy();
      });
    });
  });
  describe("Core Features Access", () => {
    it("should allow access to all core features", () => {
      const coreFeatures = [
        "sessions",
        "focus-timer",
        "streaks",
        "rewards",
        "progression",
      ];
      coreFeatures.forEach((feature: string) => {
        mockIsFeatureEnabled.mockReturnValue(true);
        mockIsFeatureDisabled.mockReturnValue(false);
        mockIsFeatureOptional.mockReturnValue(false);
        const TestComponent = () => (
          <NavigationGuard feature={feature}>
            <View testID="protected-content">
              <Text>{feature} Content</Text>
            </View>
          </NavigationGuard>
        );
        render(
          <NavigationContainer>
            <TestComponent />
          </NavigationContainer>,
        );
        expect(screen.getByTestId("protected-content")).toBeTruthy();
      });
    });
  });
  describe("Error Handling", () => {
    it("should handle unknown features gracefully", () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      mockIsFeatureDisabled.mockReturnValue(false);
      mockIsFeatureOptional.mockReturnValue(false);
      const TestComponent = () => (
        <NavigationGuard feature="unknown-feature">
          <View testID="protected-content">
            <Text>Unknown Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(screen.getByText("Feature not available")).toBeTruthy();
    });
    it("should handle feature flag errors gracefully", () => {
      mockIsFeatureEnabled.mockImplementation(() => {
        throw new Error("Feature flag error");
      });
      const TestComponent = () => (
        <NavigationGuard feature="sessions">
          <View testID="protected-content">
            <Text>Session Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(screen.getByText("Feature not available")).toBeTruthy();
    });
  });
  describe("PHASE 8 Compliance", () => {
    it("should ensure navigation respects PHASE 8 feature configuration", () => {
      const testFeatures = {
        enabled: ["sessions", "focus-timer", "streaks"],
        optional: ["boss", "challenges", "squads"],
        disabled: ["social-feed", "duels", "rankings"],
      };
      Object.entries(testFeatures).forEach(([category, features]) => {
        features.forEach((feature: string) => {
          if (category === "enabled") {
            mockIsFeatureEnabled.mockReturnValue(true);
            mockIsFeatureDisabled.mockReturnValue(false);
            mockIsFeatureOptional.mockReturnValue(false);
          } else if (category === "disabled") {
            mockIsFeatureEnabled.mockReturnValue(false);
            mockIsFeatureDisabled.mockReturnValue(true);
            mockIsFeatureOptional.mockReturnValue(false);
          } else {
            mockIsFeatureEnabled.mockReturnValue(false);
            mockIsFeatureDisabled.mockReturnValue(false);
            mockIsFeatureOptional.mockReturnValue(true);
          }
          const TestComponent = () => (
            <NavigationGuard feature={feature}>
              <View testID="protected-content">
                <Text>{feature} Content</Text>
              </View>
            </NavigationGuard>
          );
          render(
            <NavigationContainer>
              <TestComponent />
            </NavigationContainer>,
          );
          if (category === "enabled") {
            expect(screen.getByTestId("protected-content")).toBeTruthy();
          } else {
            expect(screen.queryByTestId("protected-content")).toBeFalsy();
            expect(
              screen.getByText(
                /Feature (not available|currently disabled|not yet available)/,
              ),
            ).toBeTruthy();
          }
        });
      });
    });
    it("should prevent navigation to experimental features", () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      mockIsFeatureDisabled.mockReturnValue(true);
      mockIsFeatureOptional.mockReturnValue(false);
      const TestComponent = () => (
        <NavigationGuard feature="ar-experimental">
          <View testID="protected-content">
            <Text>AR Content</Text>
          </View>
        </NavigationGuard>
      );
      render(
        <NavigationContainer>
          <TestComponent />
        </NavigationContainer>,
      );
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is currently disabled"),
      ).toBeTruthy();
    });
  });
});
