import type { ValidationError } from './validation-types';

export function validateCoachSetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes('personality') && typeof value === 'string') {
    const validPersonalities = ['supportive', 'tough', 'neutral', 'funny'];
    if (!validPersonalities.includes(value)) {
      errors.push({
        field: key,
        code: 'INVALID_PERSONALITY',
        message: `Coach personality "${value}" is not valid`,
        severity: 'error',
        recoveryHint: `Valid personalities: ${validPersonalities.join(', ')}`,
      });
    }
  }
  if (key.includes('frequency') && typeof value === 'string') {
    const validFrequencies = ['minimal', 'moderate', 'frequent', 'constant'];
    if (!validFrequencies.includes(value)) {
      errors.push({
        field: key,
        code: 'INVALID_FREQUENCY',
        message: `Coach frequency "${value}" is not valid`,
        severity: 'error',
        recoveryHint: `Valid frequencies: ${validFrequencies.join(', ')}`,
      });
    }
  }
  if (
    (key.includes('quietHours') && key.includes('start')) ||
    key.includes('end')
  ) {
    if (typeof value === 'string') {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) {
        errors.push({
          field: key,
          code: 'INVALID_TIME_FORMAT',
          message: 'Time must be in HH:MM format',
          severity: 'error',
          recoveryHint: 'Use 24-hour format (e.g., "22:00")',
        });
      }
    }
  }
}

export function validatePrivacySetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes('profileVisibility') && typeof value === 'string') {
    const validVisibilities = ['public', 'friends', 'private'];
    if (!validVisibilities.includes(value)) {
      errors.push({
        field: key,
        code: 'INVALID_VISIBILITY',
        message: `Profile visibility "${value}" is not valid`,
        severity: 'error',
        recoveryHint: `Valid options: ${validVisibilities.join(', ')}`,
      });
    }
  }
  if (key.includes('analyticsOptOut') && value === true) {
    warnings.push({
      field: key,
      code: 'ANALYTICS_DISABLED',
      message: 'Analytics disabled - app improvements may be affected',
      severity: 'warning',
      recoveryHint: 'Consider enabling analytics to help improve the app',
    });
  }
}

export function validateGeneralSetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes('language') && typeof value === 'string') {
    const validLanguages = ['en', 'es', 'fr', 'de', 'ja', 'zh'];
    if (!validLanguages.includes(value)) {
      warnings.push({
        field: key,
        code: 'UNSUPPORTED_LANGUAGE',
        message: `Language "${value}" may not be fully supported`,
        severity: 'warning',
        recoveryHint: `Supported languages: ${validLanguages.join(', ')}`,
      });
    }
  }
}

export function validateDataSetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes('retentionPolicy') && typeof value === 'string') {
    const validPolicies = ['minimal', 'standard', 'comprehensive', 'forever'];
    if (!validPolicies.includes(value)) {
      errors.push({
        field: key,
        code: 'INVALID_RETENTION_POLICY',
        message: `Retention policy "${value}" is not valid`,
        severity: 'error',
        recoveryHint: `Valid policies: ${validPolicies.join(', ')}`,
      });
    }
  }
  if (key.includes('autoExport.frequency') && typeof value === 'string') {
    const validFrequencies = ['weekly', 'monthly', 'never'];
    if (!validFrequencies.includes(value)) {
      errors.push({
        field: key,
        code: 'INVALID_EXPORT_FREQUENCY',
        message: `Export frequency "${value}" is not valid`,
        severity: 'error',
        recoveryHint: `Valid frequencies: ${validFrequencies.join(', ')}`,
      });
    }
  }
}
