import type { ValidationError, ValidationResult } from './types';

const VALID_SEVERITIES = [
  'info',
  'positive',
  'warning',
  'critical',
  'celebration',
] as const;

const VALID_INSIGHT_METRICS = [
  'sessions_completed',
  'xp_earned',
  'streak_days',
  'boss_damage_dealt',
  'items_crafted',
] as const;

export function validateInsight(insight: {
  title: string;
  description: string;
  severity: string;
  metric: string;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!insight.title || insight.title.trim().length === 0) {
    errors.push({
      field: 'title',
      code: 'EMPTY_TITLE',
      message: 'Insight title is required',
      severity: 'error',
    });
  } else if (insight.title.length > 200) {
    errors.push({
      field: 'title',
      code: 'TITLE_TOO_LONG',
      message: 'Title exceeds 200 characters',
      severity: 'error',
      recoveryHint: 'Shorten the title to under 200 characters',
      value: insight.title.length,
    });
  }

  if (!insight.description || insight.description.trim().length === 0) {
    errors.push({
      field: 'description',
      code: 'EMPTY_DESCRIPTION',
      message: 'Insight description is required',
      severity: 'error',
    });
  } else if (insight.description.length > 2000) {
    warnings.push({
      field: 'description',
      code: 'DESCRIPTION_LONG',
      message: 'Description is very long',
      severity: 'warning',
      recoveryHint: 'Consider making the description more concise',
      value: insight.description.length,
    });
  }

  if (!(VALID_SEVERITIES as readonly string[]).includes(insight.severity)) {
    errors.push({
      field: 'severity',
      code: 'INVALID_SEVERITY',
      message: `Severity "${insight.severity}" is not valid`,
      severity: 'error',
      recoveryHint: `Valid severities: ${VALID_SEVERITIES.join(', ')}`,
      value: insight.severity,
    });
  }

  if (
    !(VALID_INSIGHT_METRICS as readonly string[]).includes(insight.metric)
  ) {
    warnings.push({
      field: 'metric',
      code: 'UNKNOWN_METRIC',
      message: `Metric "${insight.metric}" may not be tracked`,
      severity: 'warning',
      recoveryHint: `Tracked metrics: ${VALID_INSIGHT_METRICS.join(', ')}`,
      value: insight.metric,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized:
      errors.length === 0
        ? {
            ...insight,
            title: insight.title.trim(),
            description: insight.description.trim(),
          }
        : undefined,
  };
}
