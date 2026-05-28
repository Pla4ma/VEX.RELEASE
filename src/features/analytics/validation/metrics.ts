import type { ValidationError, ValidationResult } from "./types";

const VALID_METRICS = [
  "sessions_completed",
  "sessions_abandoned",
  "total_focus_time",
  "average_session_duration",
  "streak_days",
  "longest_streak",
  "xp_earned",
  "level_progression",
  "boss_damage_dealt",
  "items_crafted",
  "coins_spent",
  "challenges_completed",
] as const;

export function validateMetrics(metrics: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!Array.isArray(metrics) || metrics.length === 0) {
    errors.push({
      field: "metrics",
      code: "EMPTY_SELECTION",
      message: "At least one metric must be selected",
      severity: "error",
      recoveryHint: "Select metrics like sessions_completed, xp_earned, etc.",
    });
    return { valid: false, errors, warnings };
  }

  if (metrics.length > 10) {
    warnings.push({
      field: "metrics",
      code: "TOO_MANY_METRICS",
      message: "Selecting many metrics may impact performance",
      severity: "warning",
      recoveryHint: "Limit to 5-7 most relevant metrics",
      value: metrics.length,
    });
  }

  const invalidMetrics: string[] = [];
  const seenMetrics = new Set<string>();

  for (const metric of metrics) {
    if (seenMetrics.has(metric)) {
      warnings.push({
        field: "metrics",
        code: "DUPLICATE_METRIC",
        message: `Metric "${metric}" is duplicated`,
        severity: "warning",
        recoveryHint: "Remove duplicate entries",
        value: metric,
      });
      continue;
    }
    seenMetrics.add(metric);
    if (!(VALID_METRICS as readonly string[]).includes(metric)) {
      invalidMetrics.push(metric);
    }
  }

  if (invalidMetrics.length > 0) {
    errors.push({
      field: "metrics",
      code: "INVALID_METRICS",
      message: `Invalid metrics: ${invalidMetrics.join(", ")}`,
      severity: "error",
      recoveryHint: `Valid metrics are: ${VALID_METRICS.join(", ")}`,
      value: invalidMetrics,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: errors.length === 0 ? [...seenMetrics] : undefined,
  };
}
