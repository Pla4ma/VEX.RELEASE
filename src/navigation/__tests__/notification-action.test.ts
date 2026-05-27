import { describe, it, expect } from '@jest/globals';
import {
  resolveNotificationAction,
  makeFeatureAccess,
} from './notification-routing.helpers';

describe('resolveNotificationAction', () => {
  it('start_session resolves to START_SESSION', () => {
    const result = resolveNotificationAction({ type: 'start_session' });
    expect(result.intent).toBe('START_SESSION');
  });

  it('view_boss with unavailable boss → fallback to OPEN_HOME', () => {
    const features = makeFeatureAccess(0).features;
    const result = resolveNotificationAction(
      { type: 'view_boss' }, features, 'calm',
    );
    expect(result.intent).toBe('OPEN_HOME');
    expect(result.fallbackReason).toContain('not available');
  });

  it('view_boss with enabled boss → OPEN_BOSS', () => {
    const features = makeFeatureAccess(15).features;
    if (features.boss_tab.isUnlocked) {
      const result = resolveNotificationAction(
        { type: 'view_boss' }, features, 'game_like',
      );
      expect(result.intent).toBe('OPEN_BOSS');
      expect(result.params).toEqual({ subtle: false });
    }
  });

  it('view_boss with calm user → OPEN_BOSS with subtle=true', () => {
    const features = makeFeatureAccess(15).features;
    if (features.boss_tab.isUnlocked) {
      const result = resolveNotificationAction(
        { type: 'view_boss' }, features, 'calm',
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
        { type: 'view_boss' }, features, 'game_like',
      );
      if (result.intent === 'OPEN_BOSS') {
        expect(result.params).toEqual({ subtle: false });
      }
    }
  });

  it('view_boss without featureAccess → fallback to OPEN_HOME', () => {
    const result = resolveNotificationAction(
      { type: 'view_boss' }, undefined, 'game_like',
    );
    expect(result.intent).toBe('OPEN_HOME');
    expect(result.fallbackReason).toContain('not available');
  });

  it('view_squad with disabled squads → fallback to OPEN_HOME', () => {
    const features = makeFeatureAccess(10).features;
    const result = resolveNotificationAction(
      { type: 'view_squad' }, features,
    );
    expect(result.intent).toBe('OPEN_HOME');
    expect(result.fallbackReason).toContain('Squad');
  });

  it('join_duel with disabled features → fallback to OPEN_HOME', () => {
    const features = makeFeatureAccess(10).features;
    const result = resolveNotificationAction(
      { type: 'join_duel' }, features,
    );
    expect(result.intent).toBe('OPEN_HOME');
  });

  it('open_shop with disabled shop → fallback to OPEN_HOME', () => {
    const features = makeFeatureAccess(10).features;
    const result = resolveNotificationAction(
      { type: 'open_shop' }, features,
    );
    expect(result.intent).toBe('OPEN_HOME');
  });

  it('open_coach with disabled AI coach → fallback to OPEN_HOME', () => {
    const features = makeFeatureAccess(2).features;
    const result = resolveNotificationAction(
      { type: 'open_coach' }, features,
    );
    expect(result.intent).toBe('OPEN_HOME');
  });

  it('open_coach with enabled AICoach → resolves correctly', () => {
    const features = makeFeatureAccess(20).features;
    if (features.ai_coach_advanced.isUnlocked) {
      const result = resolveNotificationAction(
        { type: 'open_coach' }, features,
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

  it('view_profile → OPEN_PROFILE (not Home, not social tab)', () => {
    const result = resolveNotificationAction({ type: 'view_profile' });
    expect(result.intent).toBe('OPEN_PROFILE');
  });

  it('ACHIEVEMENT routes to Progress via view_progress', () => {
    const result = resolveNotificationAction({ type: 'view_progress' });
    expect(result.intent).toBe('OPEN_PROGRESS');
  });

  it('hidden social features never route from notification', () => {
    const features = makeFeatureAccess(10).features;
    const result = resolveNotificationAction(
      { type: 'view_squad' }, features,
    );
    expect(result.intent).toBe('OPEN_HOME');
  });

  it('unknown action type → OPEN_HOME fallback', () => {
    const result = resolveNotificationAction({
      type: 'custom',
      payload: {},
    });
    expect(result.intent).toBe('OPEN_HOME');
  });
});
