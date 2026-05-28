import React from "react";
import { View, Text } from "react-native";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { jest } from "@jest/globals";
import { NavigationGuard } from "../NavigationGuard";

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

jest.mock("../../../constants/features", () => ({
  isFeatureEnabled: mockIsFeatureEnabled,
  isFeatureDisabled: mockIsFeatureDisabled,
  isFeatureOptional: mockIsFeatureOptional,
  getDisabledFeatures: mockGetDisabledFeatures,
}));

export function resetFeatureMocks(): void {
  jest.clearAllMocks();
  mockIsFeatureEnabled.mockReturnValue(false);
  mockIsFeatureDisabled.mockReturnValue(false);
  mockIsFeatureOptional.mockReturnValue(false);
}

export function renderGuardedFeature(feature: string): void {
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
}

export {
  mockIsFeatureEnabled,
  mockIsFeatureDisabled,
  mockIsFeatureOptional,
  mockGetDisabledFeatures,
};
