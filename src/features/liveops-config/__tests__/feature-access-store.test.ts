/**
 * LiveOps Config — Feature Access Store Tests
 *
 * Tests for the global feature access store and degraded features.
 */

import {
  setFeatureAccessMap,
  getFeatureAccessMap,
  setDegradedFeatures,
  getDegradedFeatures,
  subscribeToDegradedFeatures,
  getAvailabilityFor,
} from '../feature-access-store';
import { buildFeatureAccess } from '../feature-access';
import type { FeatureAccessMap, FeatureKey } from '../feature-access-types';

describe('feature-access-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    setFeatureAccessMap({} as FeatureAccessMap);
    setDegradedFeatures(new Set());
  });

  describe('setFeatureAccessMap / getFeatureAccessMap', () => {
    it('should store and retrieve feature access map', () => {
      const map = buildFeatureAccess({ totalCompletedSessions: 5 }).features;
      setFeatureAccessMap(map);
      expect(getFeatureAccessMap()).toEqual(map);
    });

    it('should return null when no map is set', () => {
      // After reset
      expect(getFeatureAccessMap()).toEqual({} as FeatureAccessMap);
    });
  });

  describe('setDegradedFeatures / getDegradedFeatures', () => {
    it('should store and retrieve degraded features', () => {
      const degraded = new Set<FeatureKey>(['boss_tab', 'premium_paywall']);
      setDegradedFeatures(degraded);
      const result = getDegradedFeatures();
      expect(result.has('boss_tab')).toBe(true);
      expect(result.has('premium_paywall')).toBe(true);
    });

    it('should return empty set when no degraded features', () => {
      const result = getDegradedFeatures();
      expect(result.size).toBe(0);
    });
  });

  describe('subscribeToDegradedFeatures', () => {
    it('should notify listeners when degraded features change', () => {
      const listener = jest.fn();
      const unsubscribe = subscribeToDegradedFeatures(listener);

      setDegradedFeatures(new Set<FeatureKey>(['boss_tab']));
      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it('should stop notifying after unsubscribe', () => {
      const listener = jest.fn();
      const unsubscribe = subscribeToDegradedFeatures(listener);

      unsubscribe();
      listener.mockClear();

      setDegradedFeatures(new Set<FeatureKey>(['boss_tab']));
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('getAvailabilityFor', () => {
    it('should return disabled for unknown feature key', () => {
      setFeatureAccessMap({} as FeatureAccessMap);
      const result = getAvailabilityFor('boss_tab');
      expect(result.state).toBe('disabled');
      expect(result.reason).toContain('boss_tab');
    });

    it('should return availability for known feature', () => {
      const map = buildFeatureAccess({ totalCompletedSessions: 10 }).features;
      setFeatureAccessMap(map);
      const result = getAvailabilityFor('boss_tab');
      expect(result.state).toBeDefined();
      expect(['unlocked', 'disabled', 'teased', 'degraded']).toContain(result.state);
    });

    it('should return unlocked for unlocked feature', () => {
      const map = buildFeatureAccess({ totalCompletedSessions: 100 }).features;
      setFeatureAccessMap(map);
      // focus_session should be unlocked at 100 sessions
      const result = getAvailabilityFor('focus_session');
      expect(result.state).toBe('unlocked');
    });
  });
});
