import type { SettingValue, SettingCategory } from './types';

export class SettingsValidationError extends Error {
  constructor(
    message: string,
    public key: string,
    public validationErrors: string[],
  ) {
    super(message);
    this.name = 'SettingsValidationError';
  }
}

export function validateSettingValue(
  key: string,
  value: SettingValue,
  category: SettingCategory,
): { valid: boolean; errors: string[]; sanitized?: SettingValue } {
  const errors: string[] = [];
  if (value === undefined) {
    errors.push(`Value cannot be undefined for key: ${key}`);
  }
  switch (category) {
    case 'notifications':
      if (key.includes('frequency') && typeof value === 'string') {
        const valid = ['immediate', 'daily', 'weekly', 'never'];
        if (!valid.includes(value)) {errors.push(`Invalid frequency: ${value}`);}
      }
      if (key.includes('quietHours') && value !== null) {
        const hour = Number(value);
        if (hour < 0 || hour > 23) {errors.push('Hour must be between 0 and 23');}
      }
      break;
    case 'appearance':
      if (key.includes('fontScale') && typeof value === 'number') {
        if (value < 0.5 || value > 2) {errors.push('Font scale must be between 0.5 and 2.0');}
      }
      if (key.includes('theme') && typeof value === 'string') {
        if (!['light', 'dark', 'system', 'high-contrast'].includes(value))
          {errors.push(`Invalid theme: ${value}`);}
      }
      break;
    case 'coach':
      if (key.includes('frequency') && typeof value === 'string') {
        if (!['low', 'medium', 'high'].includes(value))
          {errors.push(`Invalid frequency: ${value}`);}
      }
      break;
  }
  return { valid: errors.length === 0, errors, sanitized: errors.length === 0 ? value : undefined };
}

export function resolveConflict(
  conflict: { localTimestamp: number; remoteTimestamp: number },
): 'local' | 'remote' | 'merge' {
  return conflict.localTimestamp > conflict.remoteTimestamp ? 'local' : 'remote';
}
