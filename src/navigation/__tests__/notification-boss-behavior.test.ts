import { describe, it, expect } from '@jest/globals';
import {
  resolveNotificationAction,
  makeFeatureAccess,
} from './notification-routing.helpers';

describe('calm user boss notification behavior', () => {
  it('calm user with enabled boss gets subtle=true params', () => {
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

  it('game-like user with enabled boss gets subtle=false params', () => {
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

  it('friendly user with enabled boss gets subtle=true (not game-like)', () => {
    const features = makeFeatureAccess(15).features;
    if (features.boss_tab.isUnlocked) {
      const result = resolveNotificationAction(
        { type: 'view_boss' }, features, 'friendly',
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
        { type: 'view_boss' }, features, 'study_focused',
      );
      if (result.intent === 'OPEN_BOSS') {
        expect(result.params).toEqual({ subtle: true });
      }
    }
  });
});
