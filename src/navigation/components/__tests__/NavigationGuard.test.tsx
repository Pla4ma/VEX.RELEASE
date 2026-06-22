/**
 * Navigation Guard Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { NavigationGuard } from '../NavigationGuard';
import { FEATURE_FLAGS } from '../../../constants/features';
import { useFeatureFlags } from '../../../hooks/useFeatureFlags';

// Mock the feature flags hook
jest.mock('../../../hooks/useFeatureFlags');

describe('NavigationGuard', () => {
  const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<
    typeof useFeatureFlags
  >;

  beforeEach(() => {
    mockUseFeatureFlags.mockReturnValue({
      isEnabled: jest.fn(),
      getValue: jest.fn(),
      isLoaded: true,
      flags: new Map(),
    });
  });

  it('renders children when feature is enabled', () => {
    const mockIsEnabled = jest.fn().mockReturnValue(true);
    mockUseFeatureFlags.mockReturnValue({
      isEnabled: mockIsEnabled,
      getValue: jest.fn(),
      isLoaded: true,
      flags: new Map(),
    });

    render(
      <NavigationGuard featureFlag={FEATURE_FLAGS.BASIC_SOLO_BOSS}>
        <View testID="protected-content">Protected Content</View>
      </NavigationGuard>,
    );

    expect(screen.getByTestId('protected-content')).toBeTruthy();
    expect(mockIsEnabled).toHaveBeenCalledWith(FEATURE_FLAGS.BASIC_SOLO_BOSS);
  });

  it('renders fallback when feature is disabled', () => {
    const mockIsEnabled = jest.fn().mockReturnValue(false);
    mockUseFeatureFlags.mockReturnValue({
      isEnabled: mockIsEnabled,
      getValue: jest.fn(),
      isLoaded: true,
      flags: new Map(),
    });

    render(
      <NavigationGuard featureFlag={FEATURE_FLAGS.BASIC_SOLO_BOSS}>
        <View testID="protected-content">Protected Content</View>
      </NavigationGuard>,
    );

    expect(screen.queryByTestId('protected-content')).toBeFalsy();
    expect(mockIsEnabled).toHaveBeenCalledWith(FEATURE_FLAGS.BASIC_SOLO_BOSS);
  });

  it('renders custom fallback when provided', () => {
    const mockIsEnabled = jest.fn().mockReturnValue(false);
    mockUseFeatureFlags.mockReturnValue({
      isEnabled: mockIsEnabled,
      getValue: jest.fn(),
      isLoaded: true,
      flags: new Map(),
    });

    render(
      <NavigationGuard
        featureFlag={FEATURE_FLAGS.BASIC_SOLO_BOSS}
        fallback={<View testID="custom-fallback">Custom Fallback</View>}
      >
        <View testID="protected-content">Protected Content</View>
      </NavigationGuard>,
    );

    expect(screen.queryByTestId('protected-content')).toBeFalsy();
    expect(screen.getByTestId('custom-fallback')).toBeTruthy();
  });
});
