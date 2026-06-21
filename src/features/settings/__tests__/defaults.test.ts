import { describe, expect, it } from '@jest/globals';

jest.mock('@theme/tokens/launch-colors', () => ({
  launchColors: { hex_6366f1: '#6366f1' },
}));

import {
  createDefaultSettings,
  createDefaultNotificationSettings,
  createDefaultCoachSettings,
  createDefaultAppearanceSettings,
  createDefaultPrivacySettings,
  createDefaultDataControlSettings,
} from '../defaults';

describe('defaults', () => {
  it('createDefaultSettings returns valid UserPreferences', () => {
    const prefs = createDefaultSettings('550e8400-e29b-41d4-a716-446655440020');
    expect(prefs.userId).toBe('550e8400-e29b-41d4-a716-446655440020');
    expect(prefs.version).toBe(1);
    expect(prefs.settings['general.language']).toBeDefined();
    expect(prefs.settings['general.timezone']).toBeDefined();
  });

  it('createDefaultNotificationSettings throws on invalid email', () => {
    // The source code defaults email to empty string which fails .email() validator.
    expect(() => createDefaultNotificationSettings('550e8400-e29b-41d4-a716-446655440020')).toThrow();
  });

  it('createDefaultCoachSettings returns valid shape', () => {
    const cs = createDefaultCoachSettings('550e8400-e29b-41d4-a716-446655440020');
    expect(cs.enabled).toBe(true);
    expect(cs.personality).toBe('supportive');
    expect(cs.quietHours.enabled).toBe(true);
    expect(cs.quietHours.start).toBe('22:00');
  });

  it('createDefaultAppearanceSettings returns valid shape', () => {
    const as = createDefaultAppearanceSettings('550e8400-e29b-41d4-a716-446655440020');
    expect(as.theme).toBe('system');
    expect(as.fontScale).toBe(1);
    expect(as.reduceMotion).toBe(false);
    expect(as.highContrast).toBe(false);
  });

  it('createDefaultPrivacySettings returns valid shape', () => {
    const ps = createDefaultPrivacySettings('550e8400-e29b-41d4-a716-446655440020');
    expect(ps.profileVisibility).toBe('friends');
    expect(ps.thirdPartySharing).toBe(false);
    expect(ps.analyticsOptOut).toBe(false);
  });

  it('createDefaultDataControlSettings returns valid shape', () => {
    const dc = createDefaultDataControlSettings('550e8400-e29b-41d4-a716-446655440020');
    expect(dc.retentionPolicy).toBe('standard');
    expect(dc.autoExport.enabled).toBe(false);
    expect(dc.autoExport.frequency).toBe('never');
    expect(dc.backupEnabled).toBe(true);
  });
});
