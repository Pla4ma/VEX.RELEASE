/**
 * LiveOps Config — Feature Access Tests
 *
 * Tests for buildFeatureAccess which computes the full feature access map.
 */

import { buildFeatureAccess } from '../feature-access';
import type { FeatureAccessInputs, FeatureKey } from '../feature-access-types';

describe('feature-access', () => {
  describe('buildFeatureAccess', () => {
    it('should return features map, product tier, and stage', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 0,
      });
      expect(result.features).toBeDefined();
      expect(result.productTier).toBeDefined();
      expect(result.stage).toBeDefined();
    });

    it('should return NEW_USER stage for 0 sessions', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 0,
      });
      expect(result.stage).toBe('NEW_USER');
      expect(result.productTier).toBe('CORE_EXECUTION');
    });

    it('should return ACTIVATING stage for 1 session', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 1,
      });
      expect(result.stage).toBe('ACTIVATING');
    });

    it('should return ENGAGED stage for 5 sessions', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 5,
      });
      expect(result.stage).toBe('ENGAGED');
    });

    it('should return POWER_USER stage for 15 sessions', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 15,
      });
      expect(result.stage).toBe('POWER_USER');
    });

    it('should mark archived features as not unlocked', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 100,
      });
      // battle_pass is archived
      expect(result.features.battle_pass.isUnlocked).toBe(false);
    });

    it('should mark deactivated features as not unlocked', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 100,
      });
      // These are deactivated in the config
      const deactivatedFeatures: FeatureKey[] = ['shop', 'inventory', 'battle_pass'];
      for (const key of deactivatedFeatures) {
        expect(result.features[key].isUnlocked).toBe(false);
      }
    });

    it('should unlock features after threshold sessions', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 10,
      });
      // boss_tab has threshold 7
      expect(result.features.boss_tab.isUnlocked).toBe(true);
    });

    it('should not unlock features before threshold sessions', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 0,
      });
      expect(result.features.boss_tab.isUnlocked).toBe(false);
    });

    it('should apply degraded status from input', () => {
      const degradedFeatures = new Set<FeatureKey>(['boss_tab']);
      const result = buildFeatureAccess({
        totalCompletedSessions: 10,
        degradedFeatures,
      });
      expect(result.features.boss_tab.isDegraded).toBe(true);
    });

    it('should not mark non-degraded features as degraded', () => {
      const degradedFeatures = new Set<FeatureKey>(['boss_tab']);
      const result = buildFeatureAccess({
        totalCompletedSessions: 10,
        degradedFeatures,
      });
      expect(result.features.challenges.isDegraded).toBeFalsy();
    });

    it('should include all features from build order', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 0,
      });
      const featureKeys = Object.keys(result.features);
      expect(featureKeys.length).toBeGreaterThan(10);
      // Check some known features
      expect(result.features.focus_session).toBeDefined();
      expect(result.features.boss_tab).toBeDefined();
      expect(result.features.challenges).toBeDefined();
    });

    it('should set priority on features', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 0,
      });
      // Features should have numeric priorities
      for (const key of Object.keys(result.features)) {
        expect(typeof result.features[key as FeatureKey].priority).toBe('number');
      }
    });

    it('should set releaseState on features', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 0,
      });
      for (const key of Object.keys(result.features)) {
        expect(result.features[key as FeatureKey].releaseState).toBeDefined();
      }
    });

    it('should handle motivation profile', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 10,
        motivationProfile: {
          primary: 'game_like',
          secondary: ['competitive'],
        },
      });
      expect(result.features).toBeDefined();
    });

    it('should build features in correct order (dependencies first)', () => {
      const result = buildFeatureAccess({
        totalCompletedSessions: 100,
      });
      // If boss_tab depends on focus_session, focus_session should be unlocked
      if (result.features.boss_tab.isUnlocked) {
        expect(result.features.focus_session.isUnlocked).toBe(true);
      }
    });
  });
});
