import { resolveNotificationAction } from '../notification-routing-core';
import {
  hiddenFeatureAccess,
  availableFeatureAccess,
} from './notification-routing-product.helpers';

describe('notification routing — product journey', () => {
  describe('hidden feature notifications fall back to Home', () => {
    it('shop notification falls back to OPEN_HOME', () => {
      const result = resolveNotificationAction(
        { type: 'open_shop' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('open_chest notification falls back to OPEN_HOME', () => {
      const result = resolveNotificationAction(
        { type: 'open_chest' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('view_squad notification falls back to OPEN_HOME', () => {
      const result = resolveNotificationAction(
        { type: 'view_squad' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('join_duel notification falls back to OPEN_HOME', () => {
      const result = resolveNotificationAction(
        { type: 'join_duel' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('view_boss notification falls back when boss is hidden', () => {
      const result = resolveNotificationAction(
        { type: 'view_boss' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('open_coach notification falls back when coach is hidden', () => {
      const result = resolveNotificationAction(
        { type: 'open_coach' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('no raw route navigation', () => {
    it('custom notification with unknown screen falls back to OPEN_HOME', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'Boss' } },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom notification with allowed tab screen resolves', () => {
      const result = resolveNotificationAction(
        { type: 'custom', payload: { screen: 'Home' } },
        availableFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('safe intents always resolve', () => {
    it('start_session always resolves to START_SESSION', () => {
      const result = resolveNotificationAction(
        { type: 'start_session' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('START_SESSION');
    });

    it('view_streak resolves to START_SESSION', () => {
      const result = resolveNotificationAction(
        { type: 'view_streak' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('START_SESSION');
    });

    it('view_progress resolves to OPEN_PROGRESS', () => {
      const result = resolveNotificationAction(
        { type: 'view_progress' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_PROGRESS');
    });

    it('view_profile resolves to OPEN_PROFILE (not social tab)', () => {
      const result = resolveNotificationAction(
        { type: 'view_profile' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_PROFILE');
    });

    it('ACHIEVEMENT notification routes to Progress', () => {
      const result = resolveNotificationAction(
        { type: 'view_progress' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_PROGRESS');
    });

    it('view_profile does not route to social tab', () => {
      const result = resolveNotificationAction(
        { type: 'view_profile' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).not.toBe('OPEN_HOME');
    });

    it('hidden social features never route from notification', () => {
      const result = resolveNotificationAction(
        { type: 'view_squad' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
      expect(result.fallbackReason).toBeDefined();
    });

    it('accept_invite resolves to OPEN_PROGRESS', () => {
      const result = resolveNotificationAction(
        { type: 'accept_invite' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_PROGRESS');
    });
  });
});
