import { describe, it, expect, beforeEach } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { View, Text } from 'react-native';
import {
  resetFeatureMocks,
  renderGuardedFeature,
  mockIsEnabled,
} from './test-helpers';

describe('Navigation Guard - Access Control', () => {
  beforeEach(() => {
    resetFeatureMocks();
  });

  describe('Feature Access Control', () => {
    it('should allow navigation to enabled features', () => {
      mockIsEnabled.mockImplementation((key: string) => key === 'sessions');
      renderGuardedFeature('sessions');
      expect(screen.getByTestId('protected-content')).toBeTruthy();
    });

    it('should block navigation to disabled features', () => {
      mockIsEnabled.mockReturnValue(false);
      renderGuardedFeature('social-feed');
      expect(screen.queryByTestId('protected-content')).toBeFalsy();
      expect(screen.getByTestId('fallback-content')).toBeTruthy();
    });

    it('should show fallback for disabled features', () => {
      mockIsEnabled.mockReturnValue(false);
      renderGuardedFeature('duels');
      expect(screen.queryByTestId('protected-content')).toBeFalsy();
      expect(screen.getByText('Feature not available')).toBeTruthy();
    });
  });

  describe('Independent Feature Flags', () => {
    it('should allow access when specific feature is enabled', () => {
      mockIsEnabled.mockImplementation((key: string) => key === 'boss');
      renderGuardedFeature('boss');
      expect(screen.getByTestId('protected-content')).toBeTruthy();
    });

    it('should block access when specific feature is disabled', () => {
      mockIsEnabled.mockImplementation((key: string) => key === 'boss');
      renderGuardedFeature('challenges');
      expect(screen.queryByTestId('protected-content')).toBeFalsy();
      expect(screen.getByTestId('fallback-content')).toBeTruthy();
    });

    it('should show custom fallback when provided', () => {
      mockIsEnabled.mockReturnValue(false);
      const customFallback = (
        <View testID="custom-fallback">
          <Text>Custom unavailable message</Text>
        </View>
      );
      renderGuardedFeature('squads', customFallback);
      expect(screen.queryByTestId('protected-content')).toBeFalsy();
      expect(screen.getByTestId('custom-fallback')).toBeTruthy();
    });
  });
});
