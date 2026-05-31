import { describe, expect, it } from '@jest/globals';

import {
  validateSettingValue,
  resolveConflict,
  SettingsValidationError,
} from '../settings-validation';

describe('settings-validation (older)', () => {
  describe('validateSettingValue', () => {
    it('rejects undefined values', () => {
      const result = validateSettingValue('test.key', undefined, 'general');
      expect(result.valid).toBe(false);
    });

    it('validates notification frequency', () => {
      const result = validateSettingValue('email.frequency', 'daily', 'notifications');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid notification frequency', () => {
      const result = validateSettingValue('email.frequency', 'invalid', 'notifications');
      expect(result.valid).toBe(false);
    });

    it('validates quiet hours in range', () => {
      const result = validateSettingValue('push.quietHours', 22, 'notifications');
      expect(result.valid).toBe(true);
    });

    it('rejects quiet hours out of range', () => {
      const result = validateSettingValue('push.quietHours', 25, 'notifications');
      expect(result.valid).toBe(false);
    });

    it('validates appearance font scale', () => {
      const result = validateSettingValue('fontScale', 1.2, 'appearance');
      expect(result.valid).toBe(true);
    });

    it('rejects out-of-range font scale', () => {
      const result = validateSettingValue('fontScale', 3.0, 'appearance');
      expect(result.valid).toBe(false);
    });

    it('validates theme values', () => {
      const result = validateSettingValue('theme', 'dark', 'appearance');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid theme', () => {
      const result = validateSettingValue('theme', 'invalid', 'appearance');
      expect(result.valid).toBe(false);
    });

    it('validates coach frequency', () => {
      const result = validateSettingValue('coach.frequency', 'low', 'coach');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid coach frequency', () => {
      const result = validateSettingValue('coach.frequency', 'invalid', 'coach');
      expect(result.valid).toBe(false);
    });

    it('returns sanitized value on success', () => {
      const result = validateSettingValue('key', 'valid', 'general');
      expect(result.sanitized).toBe('valid');
    });
  });

  describe('resolveConflict', () => {
    it('returns local when local is newer', () => {
      expect(resolveConflict({ localTimestamp: 200, remoteTimestamp: 100 })).toBe('local');
    });

    it('returns remote when remote is newer', () => {
      expect(resolveConflict({ localTimestamp: 100, remoteTimestamp: 200 })).toBe('remote');
    });
  });

  describe('SettingsValidationError', () => {
    it('has correct name, key, and validationErrors', () => {
      const err = new SettingsValidationError('test message', 'test.key', ['err1']);
      expect(err.name).toBe('SettingsValidationError');
      expect(err.key).toBe('test.key');
      expect(err.validationErrors).toEqual(['err1']);
      expect(err.message).toBe('test message');
    });
  });
});
