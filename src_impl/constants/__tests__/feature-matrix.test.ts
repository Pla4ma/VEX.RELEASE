/**
 * Feature Matrix Tests - PHASE 8 Verification
 * 
 * Tests to verify all optional systems are properly configured for launch.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  isFeatureEnabled, 
  isFeatureOptional, 
  isFeatureDisabled,
  getLaunchEnabledFeatures,
  getOptionalFeatures,
  getDisabledFeatures,
  FEATURE_FLAGS
} from '../features';

describe('Feature Matrix - PHASE 8 Verification', () => {
  describe('Launch Enabled Features', () => {
    it('should have all core features enabled for launch', () => {
      const coreFeatures = [
        'sessions',
        'focus-timer', 
        'streaks',
        'rewards',
        'progression',
        'achievements',
        'ai-coach',
        'notifications',
        'settings',
        'profile',
        'analytics',
        'offline-support'
      ];

      coreFeatures.forEach(feature => {
        expect(isFeatureEnabled(feature)).toBe(true);
        expect(isFeatureOptional(feature)).toBe(false);
        expect(isFeatureDisabled(feature)).toBe(false);
      });
    });

    it('should have exactly 12 launch-enabled features', () => {
      const enabledFeatures = getLaunchEnabledFeatures();
      expect(enabledFeatures).toHaveLength(12);
      
      // Verify specific core features are enabled
      expect(enabledFeatures).toContain('sessions');
      expect(enabledFeatures).toContain('focus-timer');
      expect(enabledFeatures).toContain('streaks');
      expect(enabledFeatures).toContain('rewards');
      expect(enabledFeatures).toContain('progression');
      expect(enabledFeatures).toContain('achievements');
      expect(enabledFeatures).toContain('ai-coach');
      expect(enabledFeatures).toContain('notifications');
      expect(enabledFeatures).toContain('settings');
      expect(enabledFeatures).toContain('profile');
      expect(enabledFeatures).toContain('analytics');
      expect(enabledFeatures).toContain('offline-support');
    });
  });

  describe('Optional Features', () => {
    it('should have exactly 4 optional features for PHASE 8', () => {
      const optionalFeatures = getOptionalFeatures();
      expect(optionalFeatures).toHaveLength(4);
      
      // Verify specific optional features
      expect(optionalFeatures).toContain('boss');
      expect(optionalFeatures).toContain('challenges');
      expect(optionalFeatures).toContain('squads');
      expect(optionalFeatures).toContain('monthly-report');
    });

    it('should mark optional features as neither enabled nor disabled', () => {
      const optionalFeatures = getOptionalFeatures();
      
      optionalFeatures.forEach(feature => {
        expect(isFeatureEnabled(feature)).toBe(false);
        expect(isFeatureOptional(feature)).toBe(true);
        expect(isFeatureDisabled(feature)).toBe(false);
      });
    });
  });

  describe('Disabled Features', () => {
    it('should have exactly 9 disabled features for launch', () => {
      const disabledFeatures = getDisabledFeatures();
      expect(disabledFeatures).toHaveLength(9);
      
      // Verify specific disabled features
      expect(disabledFeatures).toContain('social-feed');
      expect(disabledFeatures).toContain('duels');
      expect(disabledFeatures).toContain('rankings');
      expect(disabledFeatures).toContain('squad-wars');
      expect(disabledFeatures).toContain('rivals');
      expect(disabledFeatures).toContain('trading');
      expect(disabledFeatures).toContain('emergency-gem-sinks');
      expect(disabledFeatures).toContain('complex-crafting');
      expect(disabledFeatures).toContain('ar-experimental');
    });

    it('should mark disabled features as explicitly disabled', () => {
      const disabledFeatures = getDisabledFeatures();
      
      disabledFeatures.forEach(feature => {
        expect(isFeatureEnabled(feature)).toBe(false);
        expect(isFeatureOptional(feature)).toBe(false);
        expect(isFeatureDisabled(feature)).toBe(true);
      });
    });
  });

  describe('Feature Flag Configuration', () => {
    it('should have complete feature flag configuration', () => {
      expect(Object.keys(FEATURE_FLAGS)).toHaveLength(25); // 12 + 4 + 9 = 25 total features
      
      // Verify all features have proper configuration
      Object.entries(FEATURE_FLAGS).forEach(([key, config]) => {
        expect(config).toHaveProperty('enabled');
        expect(config).toHaveProperty('optional');
        expect(config).toHaveProperty('disabled');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('launchScope');
        
        // Ensure mutually exclusive states
        const enabledCount = [config.enabled, config.optional, config.disabled].filter(Boolean).length;
        expect(enabledCount).toBe(1); // Exactly one state should be true
      });
    });

    it('should have proper launch scope descriptions', () => {
      const enabledFeatures = getLaunchEnabledFeatures();
      enabledFeatures.forEach(feature => {
        const config = FEATURE_FLAGS[feature];
        expect(config.launchScope).toBe('core');
        expect(config.description).toMatch(/essential|core|feature/);
      });

      const optionalFeatures = getOptionalFeatures();
      optionalFeatures.forEach(feature => {
        const config = FEATURE_FLAGS[feature];
        expect(config.launchScope).toBe('optional');
        expect(config.description).toMatch(/optional|variety/);
      });

      const disabledFeatures = getDisabledFeatures();
      disabledFeatures.forEach(feature => {
        const config = FEATURE_FLAGS[feature];
        expect(config.launchScope).toBe('disabled');
        expect(config.description).toMatch(/disabled|launch/);
      });
    });
  });

  describe('PHASE 8 Compliance', () => {
    it('should ensure no banned features are enabled', () => {
      const bannedFeatures = ['social-feed', 'duels', 'rankings', 'squad-wars', 'rivals', 'trading'];
      
      bannedFeatures.forEach(feature => {
        expect(isFeatureEnabled(feature)).toBe(false);
        expect(isFeatureDisabled(feature)).toBe(true);
      });
    });

    it('should ensure all optional features are properly gated', () => {
      const optionalFeatures = getOptionalFeatures();
      
      optionalFeatures.forEach(feature => {
        expect(isFeatureOptional(feature)).toBe(true);
        // Optional features should not be enabled by default
        expect(isFeatureEnabled(feature)).toBe(false);
      });
    });

    it('should verify feature matrix completeness', () => {
      const allFeatures = Object.keys(FEATURE_FLAGS);
      const categorizedFeatures = [
        ...getLaunchEnabledFeatures(),
        ...getOptionalFeatures(), 
        ...getDisabledFeatures()
      ];
      
      // All features should be categorized
      expect(allFeatures.sort()).toEqual(categorizedFeatures.sort());
      expect(allFeatures).toHaveLength(25);
    });

    it('should validate feature flag consistency', () => {
      Object.entries(FEATURE_FLAGS).forEach(([key, config]) => {
        // Validate boolean states
        expect(typeof config.enabled).toBe('boolean');
        expect(typeof config.optional).toBe('boolean');
        expect(typeof config.disabled).toBe('boolean');
        
        // Validate required fields
        expect(typeof config.description).toBe('string');
        expect(typeof config.launchScope).toBe('string');
        
        // Validate consistency
        const enabledCount = [config.enabled, config.optional, config.disabled].filter(Boolean).length;
        expect(enabledCount).toBe(1);
        
        // Validate launch scope matches state
        if (config.enabled) {
          expect(config.launchScope).toBe('core');
        } else if (config.optional) {
          expect(config.launchScope).toBe('optional');
        } else if (config.disabled) {
          expect(config.launchScope).toBe('disabled');
        }
      });
    });
  });
});