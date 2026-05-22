import { resolveNotificationAction } from '../notification-routing-core';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';

const hiddenFeatureAccess: Partial<FeatureAccessMap> = {
  shop: {
    isUnlocked: false,
    isVisible: false,
    lockedDescription: 'Shop not available',
    recommendedUnlockMoment: '',
    unlockReason: '',
    releaseState: 'disabled_beta',
  },
  squads: {
    isUnlocked: false,
    isVisible: false,
    lockedDescription: 'Squads not available',
    recommendedUnlockMoment: '',
    unlockReason: '',
    releaseState: 'disabled_beta',
  },
  boss_tab: {
    isUnlocked: false,
    isVisible: false,
    lockedDescription: 'Boss not available',
    recommendedUnlockMoment: '',
    unlockReason: '',
    releaseState: 'disabled_beta',
  },
  ai_coach_advanced: {
    isUnlocked: false,
    isVisible: false,
    lockedDescription: 'Advanced coach not available',
    recommendedUnlockMoment: '',
    unlockReason: '',
    releaseState: 'disabled_beta',
  },
};

const availableFeatureAccess: Partial<FeatureAccessMap> = {
  boss_tab: {
    isUnlocked: true,
    isVisible: true,
    lockedDescription: '',
    recommendedUnlockMoment: '',
    unlockReason: '',
    releaseState: 'core',
  },
  ai_coach_advanced: {
    isUnlocked: true,
    isVisible: true,
    lockedDescription: '',
    recommendedUnlockMoment: '',
    unlockReason: '',
    releaseState: 'core',
  },
  content_study: {
    isUnlocked: true,
    isVisible: true,
    lockedDescription: '',
    recommendedUnlockMoment: '',
    unlockReason: '',
    releaseState: 'core',
  },
};

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

    it('view_profile resolves to OPEN_HOME', () => {
      const result = resolveNotificationAction(
        { type: 'view_profile' },
        hiddenFeatureAccess,
        'calm',
      );
      expect(result.intent).toBe('OPEN_HOME');
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
        { ...availableFeatureAccess, ai_coach_advanced: hiddenFeatureAccess.ai_coach_advanced },
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
});
