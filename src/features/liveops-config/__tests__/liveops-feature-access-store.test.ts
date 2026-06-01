/**
 * Liveops Config Feature — feature-access-store Tests
 */

import {
  setFeatureAccessMap,
  getFeatureAccessMap,
  setDegradedFeatures,
  getDegradedFeatures,
  subscribeToDegradedFeatures,
  getAvailabilityFor,
} from '../feature-access-store';
import type { FeatureAccessMap, FeatureKey } from '../feature-access-types';

describe('feature-access-store', () => {
  beforeEach(() => {
    setFeatureAccessMap(null as unknown as FeatureAccessMap);
  });

  it('setFeatureAccessMap and getFeatureAccessMap roundtrip', () => {
    const map = { focus_session: { isUnlocked: true } } as unknown as FeatureAccessMap;
    setFeatureAccessMap(map);
    expect(getFeatureAccessMap()).toBe(map);
  });

  it('getFeatureAccessMap returns null by default', () => {
    expect(getFeatureAccessMap()).toBeNull();
  });

  it('setDegradedFeatures and getDegradedFeatures roundtrip', () => {
    const features = new Set<FeatureKey>(['content_study']);
    setDegradedFeatures(features);
    expect(getDegradedFeatures()).toBe(features);
  });

  it('getDegradedFeatures starts with premium_paywall', () => {
    // Reset to initial state
    setDegradedFeatures(new Set<FeatureKey>(['premium_paywall']));
    expect(getDegradedFeatures().has('premium_paywall')).toBe(true);
  });

  it('subscribeToDegradedFeatures returns unsubscribe function', () => {
    const unsub = subscribeToDegradedFeatures(() => {});
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('notifies listeners when degraded features change', () => {
    const listener = jest.fn();
    subscribeToDegradedFeatures(listener);
    setDegradedFeatures(new Set<FeatureKey>(['boss_tab']));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', () => {
    const listener = jest.fn();
    const unsub = subscribeToDegradedFeatures(listener);
    unsub();
    setDegradedFeatures(new Set<FeatureKey>(['boss_tab']));
    expect(listener).not.toHaveBeenCalled();
  });

  it('getAvailabilityFor returns disabled when no map set', () => {
    setFeatureAccessMap(null as unknown as FeatureAccessMap);
    const result = getAvailabilityFor('challenges');
    expect(result.state).toBe('disabled');
    expect(result.reason).toContain('not found');
  });

  it('getAvailabilityFor returns feature availability when map set', () => {
    const map = {
      challenges: {
        key: 'challenges',
        isUnlocked: true,
        isVisible: true,
        isTeased: false,
        isDegraded: false,
        disableOnDegraded: false,
        priority: 1,
        lockedDescription: 'Locked',
        recommendedUnlockMoment: 'After 5',
        unlockReason: 'Unlocks at 5',
        releaseState: 'final_release_progressive',
      },
    } as unknown as FeatureAccessMap;
    setFeatureAccessMap(map);
    const result = getAvailabilityFor('challenges');
    expect(result.state).toBe('unlocked');
  });
});
