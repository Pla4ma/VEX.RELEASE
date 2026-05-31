import { describe, expect, it } from '@jest/globals';

jest.mock('@theme/tokens/launch-colors', () => ({
  launchColors: { hex_6366f1: '#6366f1' },
}));

import {
  buildNotificationSettings,
  buildCoachSettings,
  buildAppearanceSettings,
  buildPrivacySettings,
} from '../settings-builders';

const makeSetting = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440010',
  userId: '550e8400-e29b-41d4-a716-446655440020',
  key: 'general.language',
  value: 'en',
  category: 'general' as const,
  isDefault: true,
  lastModified: Date.now(),
  ...overrides,
});

describe('settings-builders', () => {
  const mockSetting = (key: string, value: unknown) => makeSetting({ key, value });

  describe('buildNotificationSettings', () => {
    it('returns defaults when no settings present', () => {
      const result = buildNotificationSettings('user-1', []);
      expect(result.userId).toBe('user-1');
      expect(result.channels.push.enabled).toBe(true);
      expect(result.channels.email.digestFrequency).toBe('daily');
    });

    it('overrides defaults with settings', () => {
      const settings = [
        mockSetting('notifications.push.enabled', false),
        mockSetting('notifications.email.digestFrequency', 'weekly'),
      ];
      const result = buildNotificationSettings('user-1', settings);
      expect(result.channels.push.enabled).toBe(false);
      expect(result.channels.email.digestFrequency).toBe('weekly');
    });
  });

  describe('buildCoachSettings', () => {
    it('returns defaults when no settings present', () => {
      const result = buildCoachSettings('user-1', []);
      expect(result.enabled).toBe(true);
      expect(result.personality).toBe('supportive');
      expect(result.frequency).toBe('moderate');
    });

    it('overrides defaults with settings', () => {
      const settings = [
        mockSetting('coach.enabled', false),
        mockSetting('coach.personality', 'tough'),
      ];
      const result = buildCoachSettings('user-1', settings);
      expect(result.enabled).toBe(false);
      expect(result.personality).toBe('tough');
    });
  });

  describe('buildAppearanceSettings', () => {
    it('returns defaults when no settings present', () => {
      const result = buildAppearanceSettings('user-1', []);
      expect(result.theme).toBe('system');
      expect(result.fontScale).toBe(1);
      expect(result.reduceMotion).toBe(false);
    });

    it('overrides defaults with settings', () => {
      const settings = [
        mockSetting('appearance.theme', 'dark'),
        mockSetting('appearance.fontScale', 1.3),
      ];
      const result = buildAppearanceSettings('user-1', settings);
      expect(result.theme).toBe('dark');
      expect(result.fontScale).toBe(1.3);
    });
  });

  describe('buildPrivacySettings', () => {
    it('returns defaults when no settings present', () => {
      const result = buildPrivacySettings('user-1', []);
      expect(result.profileVisibility).toBe('friends');
      expect(result.showOnlineStatus).toBe(true);
      expect(result.analyticsOptOut).toBe(false);
    });

    it('overrides defaults with settings', () => {
      const settings = [
        mockSetting('privacy.profileVisibility', 'private'),
        mockSetting('privacy.analyticsOptOut', true),
      ];
      const result = buildPrivacySettings('user-1', settings);
      expect(result.profileVisibility).toBe('private');
      expect(result.analyticsOptOut).toBe(true);
    });
  });
});
