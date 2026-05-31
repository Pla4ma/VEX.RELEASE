import { describe, expect, it } from '@jest/globals';

jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

import {
  validateCoachSetting,
  validatePrivacySetting,
  validateGeneralSetting,
  validateDataSetting,
} from '../validation-preference';
import {
  validateNotificationSetting,
  validateAppearanceSetting,
} from '../validation-notification';

describe('validation-preference validators', () => {
  it('validateCoachSetting accepts valid personality', () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting('coach.personality', 'supportive', errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validateCoachSetting rejects invalid personality', () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting('coach.personality', 'angry', errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_PERSONALITY');
  });

  it('validateCoachSetting validates frequency', () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting('coach.frequency', 'moderate', errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validateCoachSetting rejects invalid frequency', () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting('coach.frequency', 'sometimes', errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
  });

  it('validateCoachSetting validates quiet hours time format', () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting('coach.quietHours.start', '22:00', errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validateCoachSetting rejects invalid time format', () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting('coach.quietHours.start', '25:00', errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_TIME_FORMAT');
  });

  it('validatePrivacySetting accepts valid visibility', () => {
    const errors: Array<{ code: string }> = [];
    validatePrivacySetting('privacy.profileVisibility', 'friends', errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validatePrivacySetting rejects invalid visibility', () => {
    const errors: Array<{ code: string }> = [];
    validatePrivacySetting('privacy.profileVisibility', 'everyone', errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_VISIBILITY');
  });

  it('validatePrivacySetting warns on analytics opt-out', () => {
    const warnings: Array<{ code: string }> = [];
    validatePrivacySetting('privacy.analyticsOptOut', true, [] as never[], warnings as never[]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe('ANALYTICS_DISABLED');
  });

  it('validateGeneralSetting warns on unsupported language', () => {
    const warnings: Array<{ code: string }> = [];
    validateGeneralSetting('general.language', 'xx', [] as never[], warnings as never[]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe('UNSUPPORTED_LANGUAGE');
  });

  it('validateDataSetting validates retention policy', () => {
    const errors: Array<{ code: string }> = [];
    validateDataSetting('data.retentionPolicy', 'standard', errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validateDataSetting rejects invalid retention policy', () => {
    const errors: Array<{ code: string }> = [];
    validateDataSetting('data.retentionPolicy', 'invalid', errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_RETENTION_POLICY');
  });

  it('validateDataSetting validates export frequency', () => {
    const errors: Array<{ code: string }> = [];
    validateDataSetting('data.autoExport.frequency', 'weekly', errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validateDataSetting rejects invalid export frequency', () => {
    const errors: Array<{ code: string }> = [];
    validateDataSetting('data.autoExport.frequency', 'daily', errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_EXPORT_FREQUENCY');
  });
});

describe('validation-notification validators', () => {
  it('validateNotificationSetting accepts valid frequency', () => {
    const errors: Array<{ code: string }> = [];
    validateNotificationSetting('email.digestFrequency', 'daily', errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validateNotificationSetting rejects invalid frequency', () => {
    const errors: Array<{ code: string }> = [];
    validateNotificationSetting('email.digestFrequency', 'invalid', errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_FREQUENCY');
  });

  it('validateNotificationSetting rejects invalid quiet hours', () => {
    const errors: Array<{ code: string }> = [];
    validateNotificationSetting('push.quietHoursStart', 25, errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_HOUR');
  });

  it('validateNotificationSetting warns about too many device tokens', () => {
    const warnings: Array<{ code: string }> = [];
    const tokens = Array.from({ length: 11 }, (_, i) => `token-${i}`);
    validateNotificationSetting('push.deviceTokens', tokens, [] as never[], warnings as never[]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe('TOO_MANY_DEVICE_TOKENS');
  });

  it('validateAppearanceSetting accepts valid font scale', () => {
    const errors: Array<{ code: string }> = [];
    validateAppearanceSetting('appearance.fontScale', 1.2, errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validateAppearanceSetting rejects out-of-range font scale', () => {
    const errors: Array<{ code: string }> = [];
    validateAppearanceSetting('appearance.fontScale', 3.0, errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_FONT_SCALE');
  });

  it('validateAppearanceSetting warns about large font scale', () => {
    const warnings: Array<{ code: string }> = [];
    validateAppearanceSetting('appearance.fontScale', 1.6, [] as never[], warnings as never[]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe('LARGE_FONT_SCALE');
  });

  it('validateAppearanceSetting accepts valid accent color', () => {
    const errors: Array<{ code: string }> = [];
    validateAppearanceSetting('appearance.accentColor', '#6366f1', errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it('validateAppearanceSetting rejects invalid accent color', () => {
    const errors: Array<{ code: string }> = [];
    validateAppearanceSetting('appearance.accentColor', 'red', errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_COLOR');
  });
});
