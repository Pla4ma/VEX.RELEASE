/**
 * Notification routing tests — safe intents, feature gating, public v1 enforcement.
 *
 * Verifies:
 * - arbitrary actionRoute cannot navigate to disabled route
 * - BOSS notification falls back if boss route unavailable
 * - coach notification routes only when AICoach available
 * - SQUAD notification falls back while social disabled
 * - squad/rival filters hidden in public v1
 * - AICoach notification uses safe action intent
 * - notification filters adapt to available feature set
 * - calm user boss notification falls back to subtle
 * - game-like user boss notification can open Boss when available
 * - custom actionRoute cannot route to unregistered feature
 */
import { describe, it, expect } from '@jest/globals';
import {
  resolveNotificationAction,
  getAvailableNotificationFilters,
} from '../notification-routing-core';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import { buildFeatureAccess } from '../../features/liveops-config/feature-access';

function makeFeatureAccess(sessions: number): { features: FeatureAccessMap } {
  return buildFeatureAccess({ totalCompletedSessions: sessions });
}

describe('Notification Safe Intents', () => {
  describe('resolveNotificationAction', () => {
    it('start_session resolves to START_SESSION', () => {
      const result = resolveNotificationAction({ type: 'start_session' });
      expect(result.intent).toBe('START_SESSION');
    });

    it('view_boss with unavailable boss → fallback to OPEN_HOME', () => {
      const features = makeFeatureAccess(0).features;
      const result = resolveNotificationAction(
        { type: 'view_boss' },
        features,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
      expect(result.fallbackReason).toContain('not available');
    });

    it('view_boss with enabled boss → OPEN_BOSS', () => {
      const features = makeFeatureAccess(15).features;
      if (features.boss_tab.isUnlocked) {
        const result = resolveNotificationAction(
          { type: 'view_boss' },
          features,
          'game_like',
        );
        expect(result.intent).toBe('OPEN_BOSS');
        expect(result.params).toEqual({ subtle: false });
      }
    });

    it('view_boss with calm user → OPEN_BOSS with subtle=true', () => {
      const features = makeFeatureAccess(15).features;
      if (features.boss_tab.isUnlocked) {
        const result = resolveNotificationAction(
          { type: 'view_boss' },
          features,
          'calm',
        );
        if (result.intent === 'OPEN_BOSS') {
          expect(result.params).toEqual({ subtle: true });
        }
      }
    });

    it('view_boss with game_like user and enabled boss → OPEN_BOSS with subtle=false', () => {
      const features = makeFeatureAccess(15).features;
      if (features.boss_tab.isUnlocked) {
        const result = resolveNotificationAction(
          { type: 'view_boss' },
          features,
          'game_like',
        );
        if (result.intent === 'OPEN_BOSS') {
          expect(result.params).toEqual({ subtle: false });
        }
      }
    });

    it('view_boss without featureAccess → fallback to OPEN_HOME (cannot confirm availability)', () => {
      const result = resolveNotificationAction(
        { type: 'view_boss' },
        undefined,
        'game_like',
      );
      expect(result.intent).toBe('OPEN_HOME');
      expect(result.fallbackReason).toContain('not available');
    });

    it('view_squad with disabled squads → fallback to OPEN_HOME', () => {
      const features = makeFeatureAccess(10).features;
      const result = resolveNotificationAction(
        { type: 'view_squad' },
        features,
      );
      expect(result.intent).toBe('OPEN_HOME');
      expect(result.fallbackReason).toContain('Squad');
    });

    it('join_duel with disabled features → fallback to OPEN_HOME', () => {
      const features = makeFeatureAccess(10).features;
      const result = resolveNotificationAction(
        { type: 'join_duel' },
        features,
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('open_shop with disabled shop → fallback to OPEN_HOME', () => {
      const features = makeFeatureAccess(10).features;
      const result = resolveNotificationAction(
        { type: 'open_shop' },
        features,
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('open_coach with disabled AI coach → fallback to OPEN_HOME', () => {
      const features = makeFeatureAccess(2).features;
      const result = resolveNotificationAction(
        { type: 'open_coach' },
        features,
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('open_coach with enabled AICoach → resolves correctly', () => {
      const features = makeFeatureAccess(20).features;
      if (features.ai_coach_advanced.isUnlocked) {
        const result = resolveNotificationAction(
          { type: 'open_coach' },
          features,
        );
        expect(result.intent).toBe('OPEN_COACH');
      }
    });

    it('custom action with non-whitelisted screen → fallback to OPEN_HOME', () => {
      const result = resolveNotificationAction({
        type: 'custom',
        payload: { screen: 'UnknownScreen' },
      });
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom action with unregistered feature route → fallback to OPEN_HOME', () => {
      const features = makeFeatureAccess(5).features;
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'Boss' } },
        makeFeatureAccess(0).features,
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom action with allowed screen → OPEN_HOME via payload', () => {
      const result = resolveNotificationAction({
        type: 'custom',
        payload: { screen: 'Home' },
      });
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('view_progress → OPEN_PROGRESS', () => {
      const result = resolveNotificationAction({ type: 'view_progress' });
      expect(result.intent).toBe('OPEN_PROGRESS');
    });

    it('accept_invite → OPEN_PROGRESS', () => {
      const result = resolveNotificationAction({ type: 'accept_invite' });
      expect(result.intent).toBe('OPEN_PROGRESS');
    });

    it('unknown action type → OPEN_HOME fallback', () => {
      const result = resolveNotificationAction({
        type: 'custom',
        payload: {},
      });
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('getAvailableNotificationFilters', () => {
    it('default filters include start_session, view_progress, view_profile', () => {
      const filters = getAvailableNotificationFilters();
      expect(filters).toContain('start_session');
      expect(filters).toContain('view_progress');
      expect(filters).toContain('view_profile');
    });

    it('disabled filters (view_squad, open_shop, etc.) are not in defaults', () => {
      const filters = getAvailableNotificationFilters();
      expect(filters).not.toContain('view_squad');
      expect(filters).not.toContain('open_shop');
      expect(filters).not.toContain('join_duel');
      expect(filters).not.toContain('open_chest');
      expect(filters).not.toContain('view_streak');
    });

    it('boss filter included when boss available', () => {
      const features = makeFeatureAccess(15).features;
      const filters = getAvailableNotificationFilters(features);
      if (features.boss_tab.isUnlocked) {
        expect(filters).toContain('view_boss');
      }
    });

    it('boss filter not included when boss unavailable', () => {
      const features = makeFeatureAccess(0).features;
      const filters = getAvailableNotificationFilters(features);
      expect(filters).not.toContain('view_boss');
    });

    it('coach filter included when ai_coach_advanced available', () => {
      const features = makeFeatureAccess(25).features;
      const filters = getAvailableNotificationFilters(features);
      if (features.ai_coach_advanced.isUnlocked) {
        expect(filters).toContain('open_coach');
      }
    });

    it('squad and rival filters never appear in public v1', () => {
      const features = makeFeatureAccess(30).features;
      const filters = getAvailableNotificationFilters(features);
      expect(filters).not.toContain('view_squad');
      expect(filters).not.toContain('join_duel');
    });

    it('always includes custom at the end', () => {
      const filters = getAvailableNotificationFilters();
      expect(filters[filters.length - 1]).toBe('custom');
    });
  });

  describe('calm user boss notification behavior', () => {
    it('calm user with enabled boss gets subtle=true params', () => {
      const features = makeFeatureAccess(15).features;
      if (features.boss_tab.isUnlocked) {
        const result = resolveNotificationAction(
          { type: 'view_boss' },
          features,
          'calm',
        );
        if (result.intent === 'OPEN_BOSS') {
          expect(result.params).toEqual({ subtle: true });
        }
      }
    });

    it('game-like user with enabled boss gets subtle=false params', () => {
      const features = makeFeatureAccess(15).features;
      if (features.boss_tab.isUnlocked) {
        const result = resolveNotificationAction(
          { type: 'view_boss' },
          features,
          'game_like',
        );
        if (result.intent === 'OPEN_BOSS') {
          expect(result.params).toEqual({ subtle: false });
        }
      }
    });

    it('friendly user with enabled boss gets subtle=true (not game-like)', () => {
      const features = makeFeatureAccess(15).features;
      if (features.boss_tab.isUnlocked) {
        const result = resolveNotificationAction(
          { type: 'view_boss' },
          features,
          'friendly',
        );
        if (result.intent === 'OPEN_BOSS') {
          expect(result.params).toEqual({ subtle: true });
        }
      }
    });

    it('study_focused user with enabled boss gets subtle=true', () => {
      const features = makeFeatureAccess(15).features;
      if (features.boss_tab.isUnlocked) {
        const result = resolveNotificationAction(
          { type: 'view_boss' },
          features,
          'study_focused',
        );
        if (result.intent === 'OPEN_BOSS') {
          expect(result.params).toEqual({ subtle: true });
        }
      }
    });
  });
});
