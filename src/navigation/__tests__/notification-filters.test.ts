import { describe, it, expect } from '@jest/globals';
import {
  resolveNotificationAction,
  getAvailableNotificationFilters,
  makeFeatureAccess,
} from './notification-routing.helpers';

describe('getAvailableNotificationFilters', () => {
  it('default filters include start_session, view_progress, view_profile', () => {
    const filters = getAvailableNotificationFilters();
    expect(filters).toContain('start_session');
    expect(filters).toContain('view_progress');
    expect(filters).toContain('view_profile');
  });

  it('disabled filters are not in defaults', () => {
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

  it('squad and rival filters never appear in final release', () => {
    const features = makeFeatureAccess(30).features;
    const filters = getAvailableNotificationFilters(features);
    expect(filters).not.toContain('view_squad');
    expect(filters).not.toContain('join_duel');
  });

  it('never includes custom as a user-facing filter', () => {
    const filters = getAvailableNotificationFilters();
    expect(filters).not.toContain('custom');
  });

  it('custom route action still supported for whitelisted legacy payloads', () => {
    const result = resolveNotificationAction({
      type: 'custom',
      payload: { screen: 'Home' },
    });
    expect(result.intent).toBe('OPEN_HOME');
  });
});
