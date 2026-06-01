import { resolveNotificationAction } from '../notification-routing-core';
import {
  hiddenFeatureAccess,
  availableFeatureAccess,
} from './notification-routing-product.helpers';

describe('notification routing — product journey', () => {
  describe('motivation style aware routing', () => {
    it('game-like user gets OPEN_BOSS when boss available', () => {
      const result = resolveNotificationAction(
        { type: 'view_boss' },
        availableFeatureAccess,
        'game_like',
      );
      expect(result.intent).toBe('OPEN_BOSS');
    });

    it('calm user with available boss still gets simplified boss redirect', () => {
      const result = resolveNotificationAction(
        { type: 'view_boss' },
        availableFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_BOSS');
      expect(result.params).toEqual({ subtle: true });
    });

    it('intense user gets OPEN_BOSS when available', () => {
      const result = resolveNotificationAction(
        { type: 'view_boss' },
        availableFeatureAccess,
        'intense',
      );
      expect(result.intent).toBe('OPEN_BOSS');
      expect(result.params).toEqual({ subtle: false });
    });
  });

  describe('feature availability gates', () => {
    it('boss notification blocked when boss not available', () => {
      const result = resolveNotificationAction(
        { type: 'view_boss' },
        { ...availableFeatureAccess, boss_tab: hiddenFeatureAccess.boss_tab },
        'game_like',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('coach notification blocked when coach not available', () => {
      const result = resolveNotificationAction(
        { type: 'open_coach' },
        {
          ...availableFeatureAccess,
          ai_coach_advanced: hiddenFeatureAccess.ai_coach_advanced,
        },
        'coach_led',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('empty or unknown actions', () => {
    it('unknown action type falls back to OPEN_HOME', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'UnknownScreen' } },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom with no screen payload falls back to OPEN_HOME', () => {
      const result = resolveNotificationAction(
        { type: 'custom' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('null motivationStyle defaults gracefully', () => {
      const result = resolveNotificationAction(
        { type: 'view_boss' },
        availableFeatureAccess,
        null,
      );
      expect(result.intent).toBe('OPEN_BOSS');
    });

    it('undefined featureAccess defaults to safe', () => {
      const result = resolveNotificationAction(
        { type: 'start_session' },
        undefined,
        'calm',
      );
      expect(result.intent).toBe('START_SESSION');
    });
  });

  describe('custom notification always routes Home (Option A)', () => {
    it('custom unknown screen → Home', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'UnknownScreen' } },
        availableFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom Boss screen → Home (not raw Boss route)', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'Boss' } },
        availableFeatureAccess,
        'game_like',
      );
      expect(result.intent).toBe('OPEN_HOME');
      expect(result.fallbackReason).toBeDefined();
    });

    it('custom Guild/Shop/Inventory → Home', () => {
      for (const screen of ['Guild', 'Shop', 'Inventory']) {
        const result = resolveNotificationAction(
          { type: 'custom', payload: { screen } },
          availableFeatureAccess,
          'calm',
        );
        expect(result.intent).toBe('OPEN_HOME');
      }
    });

    it('custom whitelisted Home screen → Home (not arbitrary navigate)', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'Home' } },
        availableFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('no raw route strings navigate directly', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'Progress' } },
        availableFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });
  });
});
