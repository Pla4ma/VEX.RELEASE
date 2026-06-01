import { describe, expect, it } from '@jest/globals';

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

import {
  validateSettingValue as validateSettingValueNew,
  validateSettingsExport,
  batchValidateSettings,
  formatValidationErrors,
} from '../validation';

describe('validation.ts (newer)', () => {
  describe('validateSettingValue', () => {
    it('rejects undefined values', () => {
      const result = validateSettingValueNew('test.key', undefined, 'general');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('UNDEFINED_VALUE');
    });

    it('warns about dot-notation key format', () => {
      const result = validateSettingValueNew('noDotKey', 'value', 'general');
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'INVALID_KEY_FORMAT')).toBe(true);
    });

    it('validates valid notification frequency', () => {
      const result = validateSettingValueNew('notifications.email.digestFrequency', 'daily', 'notifications');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid notification frequency', () => {
      const result = validateSettingValueNew('notifications.email.digestFrequency', 'invalid', 'notifications');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_FREQUENCY');
    });

    it('validates valid theme', () => {
      const result = validateSettingValueNew('appearance.theme', 'dark', 'appearance');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid theme', () => {
      const result = validateSettingValueNew('appearance.theme', 'invalid', 'appearance');
      expect(result.valid).toBe(false);
    });

    it('validates coach personality', () => {
      const result = validateSettingValueNew('coach.personality', 'supportive', 'coach');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid coach personality', () => {
      const result = validateSettingValueNew('coach.personality', 'angry', 'coach');
      expect(result.valid).toBe(false);
    });

    it('validates privacy visibility', () => {
      const result = validateSettingValueNew('privacy.profileVisibility', 'friends', 'privacy');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid privacy visibility', () => {
      const result = validateSettingValueNew('privacy.profileVisibility', 'everyone', 'privacy');
      expect(result.valid).toBe(false);
    });

    it('warns on analytics opt-out', () => {
      const result = validateSettingValueNew('privacy.analyticsOptOut', true, 'privacy');
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'ANALYTICS_DISABLED')).toBe(true);
    });

    it('validates data retention policy', () => {
      const result = validateSettingValueNew('data.retentionPolicy', 'standard', 'data');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid data retention policy', () => {
      const result = validateSettingValueNew('data.retentionPolicy', 'invalid', 'data');
      expect(result.valid).toBe(false);
    });

    it('validates general language', () => {
      const result = validateSettingValueNew('general.language', 'en', 'general');
      expect(result.valid).toBe(true);
    });

    it('warns about unsupported language', () => {
      const result = validateSettingValueNew('general.language', 'xx', 'general');
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'UNSUPPORTED_LANGUAGE')).toBe(true);
    });
  });

  describe('validateSettingsExport', () => {
    it('validates a correct export shape', () => {
      const result = validateSettingsExport({
        version: 1,
        userId: 'user-1',
        exportedAt: Date.now(),
        preferences: {},
      });
      expect(result.valid).toBe(true);
    });

    it('rejects missing version', () => {
      const result = validateSettingsExport({ userId: 'user-1' });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('MISSING_VERSION');
    });

    it('rejects invalid version', () => {
      const result = validateSettingsExport({ version: -1, userId: 'user-1' });
      expect(result.valid).toBe(false);
    });

    it('rejects missing userId', () => {
      const result = validateSettingsExport({ version: 1 });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('MISSING_USER_ID');
    });

    it('warns about missing exportedAt', () => {
      const result = validateSettingsExport({ version: 1, userId: 'user-1' });
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'MISSING_TIMESTAMP')).toBe(true);
    });
  });

  describe('batchValidateSettings', () => {
    it('validates multiple settings and returns summary', async () => {
      const result = await batchValidateSettings([
        { key: 'notifications.email.digestFrequency', value: 'daily', category: 'notifications' },
        { key: 'appearance.theme', value: 'dark', category: 'appearance' },
      ]);
      expect(result.summary.total).toBe(2);
      expect(result.summary.valid).toBe(2);
    });

    it('counts errors in summary', async () => {
      const result = await batchValidateSettings([
        { key: 'notifications.email.digestFrequency', value: 'invalid', category: 'notifications' },
        { key: 'appearance.theme', value: 'dark', category: 'appearance' },
      ]);
      expect(result.summary.valid).toBe(1);
      expect(result.summary.invalid).toBe(1);
    });
  });

  describe('formatValidationErrors', () => {
    it('formats errors into readable string', () => {
      const formatted = formatValidationErrors([
        { field: 'test.key', code: 'ERR', message: 'Test error', severity: 'error', recoveryHint: 'Fix it' },
      ]);
      expect(formatted).toContain('[ERROR]');
      expect(formatted).toContain('Test error');
      expect(formatted).toContain('Fix it');
    });
  });
});
