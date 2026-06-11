/**
 * Settings Builders Tests
 *
 * Tests for buildAppearanceSettings, buildPrivacySettings, and resolveConflict.
 */

import { buildAppearanceSettings, buildPrivacySettings } from '../settings-builders';
import { resolveConflict } from '../settings-validation';
import type { Setting } from '../types';

function makeSetting(key: string, value: unknown): Setting {
  return {
    userId: 'test-user',
    key,
    value,
    category: 'appearance',
    lastModified: Date.now(),
  };
}

describe('Settings Builders', () => {
  describe('buildAppearanceSettings', () => {
    it('builds defaults when no settings provided', () => {
      const result = buildAppearanceSettings('user-1', []);
      expect(result.userId).toBe('user-1');
      expect(result.theme).toBe('system');
      expect(result.fontScale).toBe(1);
      expect(result.useSystemFont).toBe(true);
      expect(result.reduceMotion).toBe(false);
      expect(result.highContrast).toBe(false);
      expect(result.compactMode).toBe(false);
    });

    it('uses provided settings', () => {
      const settings: Setting[] = [
        makeSetting('appearance.theme', 'dark'),
        makeSetting('appearance.fontScale', 1.5),
        makeSetting('appearance.reduceMotion', true),
      ];
      const result = buildAppearanceSettings('user-1', settings);
      expect(result.theme).toBe('dark');
      expect(result.fontScale).toBe(1.5);
      expect(result.reduceMotion).toBe(true);
    });

    it('includes accent color', () => {
      const result = buildAppearanceSettings('user-1', []);
      expect(result.accentColor).toBeDefined();
      expect(typeof result.accentColor).toBe('string');
    });
  });

  describe('buildPrivacySettings', () => {
    it('builds defaults when no settings provided', () => {
      const result = buildPrivacySettings('user-1', []);
      expect(result.userId).toBe('user-1');
      expect(result.profileVisibility).toBe('friends');
      expect(result.showOnlineStatus).toBe(true);
      expect(result.showActivityStatus).toBe(true);
      expect(result.allowDataAnalysis).toBe(true);
      expect(result.allowPersonalization).toBe(true);
      expect(result.thirdPartySharing).toBe(false);
      expect(result.analyticsOptOut).toBe(false);
    });

    it('uses provided settings', () => {
      const settings: Setting[] = [
        makeSetting('privacy.profileVisibility', 'private'),
        makeSetting('privacy.showOnlineStatus', false),
        makeSetting('privacy.analyticsOptOut', true),
      ];
      const result = buildPrivacySettings('user-1', settings);
      expect(result.profileVisibility).toBe('private');
      expect(result.showOnlineStatus).toBe(false);
      expect(result.analyticsOptOut).toBe(true);
    });
  });

  describe('resolveConflict', () => {
    it('returns local when local timestamp is newer', () => {
      const result = resolveConflict({
        localTimestamp: 1000,
        remoteTimestamp: 500,
      });
      expect(result).toBe('local');
    });

    it('returns remote when remote timestamp is newer', () => {
      const result = resolveConflict({
        localTimestamp: 500,
        remoteTimestamp: 1000,
      });
      expect(result).toBe('remote');
    });

    it('returns remote when timestamps are equal', () => {
      const result = resolveConflict({
        localTimestamp: 1000,
        remoteTimestamp: 1000,
      });
      expect(result).toBe('remote');
    });
  });
});
