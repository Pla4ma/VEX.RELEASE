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
    it('should block all explicitly disabled features', async () => {
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
      for (const feature of disabledFeatures) {
        mockIsEnabled.mockReturnValue(false);
        await renderGuardedFeature(feature);
        expect(screen.queryByTestId('protected-content')).toBeFalsy();
        expect(screen.getByTestId('fallback-content')).toBeTruthy();
      }
    });
    it('should verify banned features are properly blocked', async () => {
      const bannedFeatures = [
        'social-feed',
        'duels',
        'rankings',
        'squad-wars',
        'rivals',
        'trading',
      ];
      for (const feature of bannedFeatures) {
        mockIsEnabled.mockReturnValue(false);
        await renderGuardedFeature(feature);
        expect(screen.queryByTestId('protected-content')).toBeFalsy();
        expect(screen.getByTestId('fallback-content')).toBeTruthy();
      }
    });
  });

  describe('Core Features Access', () => {
    it('should allow access to all core features', async () => {
      const coreFeatures = [
        'sessions',
        'focus-timer',
        'streaks',
        'rewards',
        'progression',
      ];
      for (const feature of coreFeatures) {
        mockIsEnabled.mockReturnValue(true);
        await renderGuardedFeature(feature);
        expect(screen.getByTestId('protected-content')).toBeTruthy();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown features gracefully', async () => {
      // Unknown features are not enabled by default (isEnabled returns false)
      await renderGuardedFeature('unknown-feature');
      expect(screen.queryByTestId('protected-content')).toBeFalsy();
      expect(screen.getByTestId('fallback-content')).toBeTruthy();
    });
    it('should handle feature flag errors gracefully', async () => {
      mockIsEnabled.mockImplementation(() => {
        throw new Error('Feature flag error');
      });
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      await expect(renderGuardedFeature('sessions')).rejects.toThrow(
        'Feature flag error',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('PHASE 8 Compliance', () => {
    it('should ensure navigation respects PHASE 8 feature configuration', async () => {
      const testFeatures = {
        enabled: ['sessions', 'focus-timer', 'streaks'],
        disabled: ['social-feed', 'duels', 'rankings'],
      };
      for (const [category, features] of Object.entries(testFeatures)) {
        for (const feature of features) {
          mockIsEnabled.mockReturnValue(category === 'enabled');
          await renderGuardedFeature(feature);
          if (category === 'enabled') {
            expect(screen.getByTestId('protected-content')).toBeTruthy();
          } else {
            expect(screen.queryByTestId('protected-content')).toBeFalsy();
            expect(screen.getByTestId('fallback-content')).toBeTruthy();
          }
        }
      }
    });
    it('should prevent navigation to experimental features', async () => {
      mockIsEnabled.mockReturnValue(false);
      await renderGuardedFeature('ar-experimental');
      expect(screen.queryByTestId('protected-content')).toBeFalsy();
      expect(screen.getByTestId('fallback-content')).toBeTruthy();
    });
  });
});
