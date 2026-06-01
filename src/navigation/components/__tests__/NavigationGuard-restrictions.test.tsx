import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import {
  resetFeatureMocks,
  renderGuardedFeature,
  mockIsEnabled,
} from './test-helpers';

describe('Navigation Guard - Restrictions & Compliance', () => {
  beforeEach(() => {
    resetFeatureMocks();
  });

  describe('Disabled Features Verification', () => {
    it('should block all explicitly disabled features', () => {
      const disabledFeatures = [
        'social-feed',
        'duels',
        'rankings',
        'squad-wars',
        'rivals',
        'trading',
        'emergency-gem-sinks',
        'complex-crafting',
        'ar-experimental',
      ];
      disabledFeatures.forEach((feature: string) => {
        mockIsEnabled.mockReturnValue(false);
        renderGuardedFeature(feature);
        expect(screen.queryByTestId('protected-content')).toBeFalsy();
        expect(screen.getByTestId('fallback-content')).toBeTruthy();
      });
    });
    it('should verify banned features are properly blocked', () => {
      const bannedFeatures = [
        'social-feed',
        'duels',
        'rankings',
        'squad-wars',
        'rivals',
        'trading',
      ];
      bannedFeatures.forEach((feature: string) => {
        mockIsEnabled.mockReturnValue(false);
        renderGuardedFeature(feature);
        expect(screen.queryByTestId('protected-content')).toBeFalsy();
        expect(screen.getByTestId('fallback-content')).toBeTruthy();
      });
    });
  });

  describe('Core Features Access', () => {
    it('should allow access to all core features', () => {
      const coreFeatures = [
        'sessions',
        'focus-timer',
        'streaks',
        'rewards',
        'progression',
      ];
      coreFeatures.forEach((feature: string) => {
        mockIsEnabled.mockReturnValue(true);
        renderGuardedFeature(feature);
        expect(screen.getByTestId('protected-content')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown features gracefully', () => {
      // Unknown features are not enabled by default (isEnabled returns false)
      renderGuardedFeature('unknown-feature');
      expect(screen.queryByTestId('protected-content')).toBeFalsy();
      expect(screen.getByTestId('fallback-content')).toBeTruthy();
    });
    it('should handle feature flag errors gracefully', () => {
      mockIsEnabled.mockImplementation(() => {
        throw new Error('Feature flag error');
      });
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(() => renderGuardedFeature('sessions')).toThrow(
        'Feature flag error',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('PHASE 8 Compliance', () => {
    it('should ensure navigation respects PHASE 8 feature configuration', () => {
      const testFeatures = {
        enabled: ['sessions', 'focus-timer', 'streaks'],
        disabled: ['social-feed', 'duels', 'rankings'],
      };
      Object.entries(testFeatures).forEach(([category, features]) => {
        features.forEach((feature: string) => {
          mockIsEnabled.mockReturnValue(category === 'enabled');
          renderGuardedFeature(feature);
          if (category === 'enabled') {
            expect(screen.getByTestId('protected-content')).toBeTruthy();
          } else {
            expect(screen.queryByTestId('protected-content')).toBeFalsy();
            expect(screen.getByTestId('fallback-content')).toBeTruthy();
          }
        });
      });
    });
    it('should prevent navigation to experimental features', () => {
      mockIsEnabled.mockReturnValue(false);
      renderGuardedFeature('ar-experimental');
      expect(screen.queryByTestId('protected-content')).toBeFalsy();
      expect(screen.getByTestId('fallback-content')).toBeTruthy();
    });
  });
});
