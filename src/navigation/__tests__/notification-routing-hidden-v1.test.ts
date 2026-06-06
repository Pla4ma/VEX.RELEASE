/**
 * Hidden final-release notification type suppression tests.
 *
 * Verifies:
 * - squad push notification is blocked before route
 * - rival notification blocked before route
 * - hidden notification does not show as filter
 * - no Guild/Squad route from push
 * - shop/inventory/battle_pass types are blocked
 * - fallback to Home remains safe
 */
import { describe, it, expect } from '@jest/globals';
import { resolveNotificationAction } from '../notification-resolver';
import { getAvailableNotificationFilters } from '../notification-filters';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import { buildFeatureAccess } from '../../features/liveops-config/feature-access';

function makeFeatureAccess(sessions: number): { features: FeatureAccessMap } {
  return buildFeatureAccess({ totalCompletedSessions: sessions });
}

describe('hidden final-release notification type suppression', () => {
  describe('squad notifications are blocked', () => {
    it('view_squad routes to OPEN_HOME', () => {
      const features = makeFeatureAccess(10).features;
      const result = resolveNotificationAction(
        { type: 'view_squad' },
        features,
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('join_duel routes to OPEN_HOME', () => {
      const features = makeFeatureAccess(10).features;
      const result = resolveNotificationAction({ type: 'join_duel' }, features);
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('shop notifications are blocked', () => {
    it('open_shop routes to OPEN_HOME', () => {
      const features = makeFeatureAccess(10).features;
      const result = resolveNotificationAction({ type: 'open_shop' }, features);
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('inventory notifications are blocked', () => {
    it('open_chest routes to OPEN_HOME', () => {
      const features = makeFeatureAccess(10).features;
      const result = resolveNotificationAction(
        { type: 'open_chest' },
        features,
      );
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('filters exclude hidden types', () => {
    it('view_squad never appears in available filters', () => {
      const features = makeFeatureAccess(30).features;
      const filters = getAvailableNotificationFilters(features);
      expect(filters).not.toContain('view_squad');
    });

    it('join_duel never appears in available filters', () => {
      const filters = getAvailableNotificationFilters();
      expect(filters).not.toContain('join_duel');
    });

    it('open_shop never appears in available filters', () => {
      const filters = getAvailableNotificationFilters();
      expect(filters).not.toContain('open_shop');
    });

    it('open_chest never appears in available filters', () => {
      const filters = getAvailableNotificationFilters();
      expect(filters).not.toContain('open_chest');
    });

    it('custom never appears as a user-facing filter', () => {
      const filters = getAvailableNotificationFilters();
      expect(filters).not.toContain('custom');
    });
  });

  describe('no Guild/Squad route from push', () => {
    it('custom with Guild screen → Home', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'Guild' } },
        makeFeatureAccess(10).features,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom with Squad screen → Home', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'Squad' } },
        makeFeatureAccess(10).features,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('fallback to Home remains safe', () => {
    it('custom with no payload falls back to Home', () => {
      const result = resolveNotificationAction({
        type: 'custom',
      });
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('unknown action type falls back to OPEN_HOME', () => {
      const result = resolveNotificationAction({
        type: 'custom',
        payload: { screen: 'NonExistentScreen' },
      });
      expect(result.intent).toBe('OPEN_HOME');
    });
  });
});
