/**
 * Feature Flag Matrix Tests
 *
 * Tests for PHASE 8 feature flag configuration to ensure:
 * - Launch-enabled features are enabled by default
 * - Optional features are disabled by default but can be enabled
 * - Disabled features are properly disabled
 */

import {
  FEATURE_FLAGS,
  FEATURE_FLAG_DEFAULTS,
  FEATURE_GROUPS,
} from '../features';

describe('Feature Flag Matrix - PHASE 8', () => {
  describe('Core Features - Launch Enabled by Default', () => {
    const coreFeatures = [
      FEATURE_FLAGS.SESSIONS,
      FEATURE_FLAGS.SESSION_GRADING,
      FEATURE_FLAGS.FOCUS_SCORE,
      FEATURE_FLAGS.DAILY_MISSION,
      FEATURE_FLAGS.COMPANION,
      FEATURE_FLAGS.STREAKS,
      FEATURE_FLAGS.COMEBACK_QUEST,
      FEATURE_FLAGS.BASIC_REWARDS,
      FEATURE_FLAGS.XP_PROGRESSION,
      FEATURE_FLAGS.AI_COACH_BASICS,
      FEATURE_FLAGS.PAYWALL,
      FEATURE_FLAGS.SETTINGS,
    ];

    coreFeatures.forEach((feature) => {
      it(`should have ${feature} enabled by default`, () => {
        expect(FEATURE_FLAG_DEFAULTS[feature]).toBe(true);
      });

      it(`should include ${feature} in core group`, () => {
        expect(FEATURE_GROUPS.core).toContain(feature);
      });
    });
  });

  describe('Optional Features - Launch Optional', () => {
    const optionalFeatures = [
      FEATURE_FLAGS.BASIC_SOLO_BOSS,
      FEATURE_FLAGS.BASIC_CHALLENGES,
      FEATURE_FLAGS.SQUADS_ACCOUNTABILITY,
      FEATURE_FLAGS.MONTHLY_REPORT,
    ];

    optionalFeatures.forEach((feature) => {
      it(`should have ${feature} disabled by default (can be enabled if stable)`, () => {
        expect(FEATURE_FLAG_DEFAULTS[feature]).toBe(false);
      });

      it(`should include ${feature} in optional group`, () => {
        expect(FEATURE_GROUPS.optional).toContain(feature);
      });
    });
  });

  describe('Disabled Features - Launch Disabled', () => {
    const disabledFeatures = [
      FEATURE_FLAGS.SOCIAL_FEED,
      FEATURE_FLAGS.DUELS,
      FEATURE_FLAGS.RANKINGS,
      FEATURE_FLAGS.SQUAD_WARS,
      FEATURE_FLAGS.RIVALS,
      FEATURE_FLAGS.TRADING,
      FEATURE_FLAGS.EMERGENCY_GEM_SINKS,
      FEATURE_FLAGS.COMPLEX_CRAFTING,
      FEATURE_FLAGS.AR_EXPERIMENTAL,
    ];

    disabledFeatures.forEach((feature) => {
      it(`should have ${feature} disabled by default`, () => {
        expect(FEATURE_FLAG_DEFAULTS[feature]).toBe(false);
      });

      it(`should include ${feature} in disabled group`, () => {
        expect(FEATURE_GROUPS.disabled).toContain(feature);
      });
    });
  });

  describe('Feature Group Completeness', () => {
    it('should have all features defined in exactly one launch group', () => {
      const allLaunchFeatures = [
        ...FEATURE_GROUPS.core,
        ...FEATURE_GROUPS.optional,
        ...FEATURE_GROUPS.disabled,
      ];

      const launchFeatureFlags = [
        ...Object.values(FEATURE_FLAGS).filter((f) =>
          allLaunchFeatures.includes(f),
        ),
      ];

      expect(allLaunchFeatures).toHaveLength(launchFeatureFlags.length);

      // Check for duplicates
      const uniqueFeatures = new Set(allLaunchFeatures);
      expect(uniqueFeatures.size).toBe(allLaunchFeatures.length);
    });

    it('should have exactly 12 core features', () => {
      expect(FEATURE_GROUPS.core).toHaveLength(12);
    });

    it('should have exactly 4 optional features', () => {
      expect(FEATURE_GROUPS.optional).toHaveLength(4);
    });

    it('should have exactly 9 disabled features', () => {
      expect(FEATURE_GROUPS.disabled).toHaveLength(9);
    });
  });

  describe('Navigation Safety', () => {
    it('should not have any disabled features in core navigation paths', () => {
      const navigationCriticalFeatures = [
        FEATURE_FLAGS.SESSIONS,
        FEATURE_FLAGS.SESSION_GRADING,
        FEATURE_FLAGS.FOCUS_SCORE,
        FEATURE_FLAGS.DAILY_MISSION,
        FEATURE_FLAGS.SETTINGS,
      ];

      navigationCriticalFeatures.forEach((feature) => {
        expect(FEATURE_FLAG_DEFAULTS[feature]).toBe(true);
        expect(FEATURE_GROUPS.core).toContain(feature);
      });
    });

    it('should have social features properly disabled', () => {
      const socialFeatures = [
        FEATURE_FLAGS.SOCIAL_FEED,
        FEATURE_FLAGS.DUELS,
        FEATURE_FLAGS.RANKINGS,
        FEATURE_FLAGS.SQUAD_WARS,
        FEATURE_FLAGS.RIVALS,
        FEATURE_FLAGS.TRADING,
      ];

      socialFeatures.forEach((feature) => {
        expect(FEATURE_FLAG_DEFAULTS[feature]).toBe(false);
        expect(FEATURE_GROUPS.disabled).toContain(feature);
      });
    });
  });
});
