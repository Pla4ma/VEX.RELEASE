import {
  validateSettingValue,
} from '../validation';

describe('validateSettingValue', () => {
  it('should validate notification frequency', () => {
    const result = validateSettingValue(
      'notifications.email.digestFrequency',
      'daily',
      'notifications',
    );
    expect(result.valid).toBe(true);
  });
  it('should reject invalid notification frequency', () => {
    const result = validateSettingValue(
      'notifications.email.digestFrequency',
      'invalid',
      'notifications',
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_FREQUENCY');
  });
  it('should validate quiet hours', () => {
    const result = validateSettingValue(
      'notifications.push.quietHoursStart',
      22,
      'notifications',
    );
    expect(result.valid).toBe(true);
  });
  it('should reject invalid quiet hours', () => {
    const result = validateSettingValue(
      'notifications.push.quietHoursStart',
      25,
      'notifications',
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_HOUR');
  });
  it('should validate appearance font scale', () => {
    const result = validateSettingValue(
      'appearance.fontScale',
      1.2,
      'appearance',
    );
    expect(result.valid).toBe(true);
  });
  it('should reject invalid font scale', () => {
    const result = validateSettingValue(
      'appearance.fontScale',
      3.0,
      'appearance',
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_FONT_SCALE');
  });
  it('should warn about large font scale', () => {
    const result = validateSettingValue(
      'appearance.fontScale',
      1.6,
      'appearance',
    );
    expect(result.valid).toBe(true);
    expect(result.warnings[0].code).toBe('LARGE_FONT_SCALE');
  });
  it('should validate theme', () => {
    const result = validateSettingValue(
      'appearance.theme',
      'dark',
      'appearance',
    );
    expect(result.valid).toBe(true);
  });
  it('should reject invalid theme', () => {
    const result = validateSettingValue(
      'appearance.theme',
      'invalid',
      'appearance',
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_THEME');
  });
  it('should validate accent color', () => {
    const result = validateSettingValue(
      'appearance.accentColor',
      '#6366f1',
      'appearance',
    );
    expect(result.valid).toBe(true);
  });
  it('should reject invalid accent color', () => {
    const result = validateSettingValue(
      'appearance.accentColor',
      'red',
      'appearance',
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_COLOR');
  });
  it('should validate coach personality', () => {
    const result = validateSettingValue(
      'coach.personality',
      'supportive',
      'coach',
    );
    expect(result.valid).toBe(true);
  });
  it('should reject invalid coach personality', () => {
    const result = validateSettingValue(
      'coach.personality',
      'angry',
      'coach',
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_PERSONALITY');
  });
  it('should validate coach frequency', () => {
    const result = validateSettingValue(
      'coach.frequency',
      'moderate',
      'coach',
    );
    expect(result.valid).toBe(true);
  });
  it('should reject invalid coach frequency', () => {
    const result = validateSettingValue(
      'coach.frequency',
      'sometimes',
      'coach',
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_FREQUENCY');
  });
  it('should validate privacy visibility', () => {
    const result = validateSettingValue(
      'privacy.profileVisibility',
      'friends',
      'privacy',
    );
    expect(result.valid).toBe(true);
  });
  it('should reject invalid visibility', () => {
    const result = validateSettingValue(
      'privacy.profileVisibility',
      'everyone',
      'privacy',
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_VISIBILITY');
  });
  it('should warn about analytics opt out', () => {
    const result = validateSettingValue(
      'privacy.analyticsOptOut',
      true,
      'privacy',
    );
    expect(result.valid).toBe(true);
    expect(result.warnings[0].code).toBe('ANALYTICS_DISABLED');
  });
  it('should warn about invalid key format', () => {
    const result = validateSettingValue('invalidkey', 'value', 'general');
    expect(result.valid).toBe(true);
    expect(result.warnings[0].code).toBe('INVALID_KEY_FORMAT');
  });
  it('should reject undefined values', () => {
    const result = validateSettingValue('test.key', undefined, 'general');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('UNDEFINED_VALUE');
  });
});
