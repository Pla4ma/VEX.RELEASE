import React from 'react';
import { View, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { jest } from '@jest/globals';
import { NavigationGuard } from '../NavigationGuard';

const mockIsEnabled = jest.fn();

jest.mock('../../../hooks/useFeatureFlags', () => ({
  useFeatureFlags: () => ({
    isEnabled: mockIsEnabled,
  }),
}));

export function resetFeatureMocks(): void {
  jest.clearAllMocks();
  mockIsEnabled.mockReturnValue(false);
}

export function renderGuardedFeature(
  feature: string,
  fallback?: React.ReactNode,
): void {
  const defaultFallback = (
    <View testID="fallback-content">
      <Text>Feature not available</Text>
    </View>
  );
  const TestComponent = () => (
    <NavigationGuard
      featureFlag={feature}
      fallback={fallback ?? defaultFallback}
    >
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

export { mockIsEnabled };
