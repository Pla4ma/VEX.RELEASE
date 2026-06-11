/**
 * LiveOps Config — Feature Flag Health Tests
 *
 * Tests for health check eligibility and deactivated feature detection.
 */

import {
  shouldRunHealthCheck,
  getDeactivatedFeatureKeys,
} from '../feature-flag-health';
import { DISABLED_FEATURES } from '../FeatureFlagService';
import type { FeatureKey } from '../feature-access-types';

describe('feature-flag-health', () => {
  describe('shouldRunHealthCheck', () => {
    it('should return true for root eligible features', () => {
      expect(shouldRunHealthCheck('content_study', 0, [])).toBe(true);
      expect(shouldRunHealthCheck('content_study_advanced', 0, [])).toBe(true);
    });

    it('should return false for disabled features', () => {
      const disabled: FeatureKey[] = ['boss_tab'];
      expect(shouldRunHealthCheck('boss_tab', 100, disabled)).toBe(false);
    });

    it('should return false for proximity-gated features below threshold', () => {
      // premium_paywall has proximity gate at 5 sessions
      expect(shouldRunHealthCheck('premium_paywall', 4, [])).toBe(false);
    });

    it('should return true for proximity-gated features at threshold', () => {
      expect(shouldRunHealthCheck('premium_paywall', 5, [])).toBe(true);
    });

    it('should return true for proximity-gated features above threshold', () => {
      expect(shouldRunHealthCheck('boss_tab', 10, [])).toBe(true);
      expect(shouldRunHealthCheck('ai_coach_advanced', 10, [])).toBe(true);
    });

    it('should return false for unknown features', () => {
      expect(shouldRunHealthCheck('focus_session', 100, [])).toBe(false);
    });

    it('should return false for features not in any health check list', () => {
      expect(shouldRunHealthCheck('challenges', 100, [])).toBe(false);
    });
  });

  describe('getDeactivatedFeatureKeys', () => {
    it('should return set of deactivated features', () => {
      const disabled: FeatureKey[] = ['shop', 'inventory'];
      const result = getDeactivatedFeatureKeys(disabled);
      expect(result.has('shop')).toBe(true);
      expect(result.has('inventory')).toBe(true);
    });

    it('should return empty set for empty input', () => {
      const result = getDeactivatedFeatureKeys([]);
      expect(result.size).toBe(0);
    });

    it('should return ReadonlySet', () => {
      const result = getDeactivatedFeatureKeys(['shop']);
      expect(result).toBeInstanceOf(Set);
    });
  });

  describe('DISABLED_FEATURES', () => {
    it('should be an array', () => {
      expect(Array.isArray(DISABLED_FEATURES)).toBe(true);
    });

    it('should contain known disabled features', () => {
      // These are the features marked as disabled in feature-flags.json
      expect(DISABLED_FEATURES.length).toBeGreaterThan(0);
    });
  });
});
