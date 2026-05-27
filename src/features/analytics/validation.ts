import { z } from "zod";
import * as Sentry from "@sentry/react-native";
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning";
  recoveryHint?: string;
  value?: unknown;
}
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  sanitized?: unknown;
}
export class AnalyticsValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string,
    public recoveryHint?: string,
    public value?: unknown,
  ) {
    super(message);
    this.name = "AnalyticsValidationError";
  }
}
export function validateTimeRange(
  startDate: number,
  endDate: number,
  maxRangeDays: number = 365,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!Number.isFinite(startDate) || startDate < 0) {
    errors.push({
      field: "startDate",
      code: "INVALID_TIMESTAMP",
      message: "Start date must be a valid timestamp",
      severity: "error",
      recoveryHint: "Use Date.now() or new Date().getTime()",
      value: startDate,
    });
  }
  if (!Number.isFinite(endDate) || endDate < 0) {
    errors.push({
      field: "endDate",
      code: "INVALID_TIMESTAMP",
      message: "End date must be a valid timestamp",
      severity: "error",
      recoveryHint: "Use Date.now() or new Date().getTime()",
      value: endDate,
    });
  }
  if (startDate >= endDate) {
    errors.push({
      field: "dateRange",
      code: "INVERTED_RANGE",
      message: "Start date must be before end date",
      severity: "error",
      recoveryHint: "Swap start and end dates",
    });
  }
  const now = Date.now();
  if (endDate > now + 60000) {
    warnings.push({
      field: "endDate",
      code: "FUTURE_DATE",
      message: "End date is in the future",
      severity: "warning",
      recoveryHint: "Use current time or past dates for historical data",
      value: endDate,
    });
  }
  const rangeDays = (endDate - startDate) / (24 * 60 * 60 * 1000);
  if (rangeDays > maxRangeDays) {
    errors.push({
      field: "dateRange",
      code: "RANGE_TOO_LARGE",
      message: `Date range exceeds maximum of ${maxRangeDays} days`,
      severity: "error",
      recoveryHint: `Reduce range to ${maxRangeDays} days or less`,
      value: rangeDays,
    });
  }
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
  if (startDate < oneYearAgo && rangeDays > 30) {
    warnings.push({
      field: "startDate",
      code: "VERY_OLD_DATA",
      message: "Querying data older than 1 year may be slow",
      severity: "warning",
      recoveryHint: "Consider using aggregated stats for historical data",
      value: startDate,
    });
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized:
      errors.length === 0 ? { startDate, endDate, rangeDays } : undefined,
  };
}
export function validateMetrics(metrics: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const validMetrics = [
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
  ];
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
  const seenMetrics = new Set();
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
    if (!validMetrics.includes(metric)) {
      invalidMetrics.push(metric);
    }
  }
  if (invalidMetrics.length > 0) {
    errors.push({
      field: "metrics",
      code: "INVALID_METRICS",
      message: `Invalid metrics: ${invalidMetrics.join(", ")}`,
      severity: "error",
      recoveryHint: `Valid metrics are: ${validMetrics.join(", ")}`,
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
export function validateExportConfig(config: {
  format: string;
  dataTypes?: string[];
  dateRange: { start: number; end: number };
  userId: string;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const validFormats = ["json", "csv"];
  if (!validFormats.includes(config.format)) {
    errors.push({
      field: "format",
      code: "INVALID_FORMAT",
      message: `Export format "${config.format}" is not supported`,
      severity: "error",
      recoveryHint: `Supported formats: ${validFormats.join(", ")}`,
      value: config.format,
    });
  }
  if (!config.userId || typeof config.userId !== "string") {
    errors.push({
      field: "userId",
      code: "MISSING_USER_ID",
      message: "User ID is required",
      severity: "error",
      recoveryHint: "Provide a valid user ID",
    });
  }
  const validDataTypes = [
    "sessions",
    "xp",
    "streaks",
    "boss",
    "items",
    "challenges",
  ];
  const dataTypes = config.dataTypes || validDataTypes;
  for (const type of dataTypes) {
    if (!validDataTypes.includes(type)) {
      warnings.push({
        field: "dataTypes",
        code: "UNKNOWN_DATA_TYPE",
        message: `Data type "${type}" may not be available`,
        severity: "warning",
        recoveryHint: `Available types: ${validDataTypes.join(", ")}`,
        value: type,
      });
    }
  }
  const rangeDays =
    (config.dateRange.end - config.dateRange.start) / (24 * 60 * 60 * 1000);
  const estimatedSize = dataTypes.length * rangeDays * 100;
  if (estimatedSize > 50 * 1024 * 1024) {
    warnings.push({
      field: "dateRange",
      code: "LARGE_EXPORT",
      message: `Export may be very large (~${Math.round(estimatedSize / 1024 / 1024)}MB)`,
      severity: "warning",
      recoveryHint: "Reduce date range or select fewer data types",
      value: estimatedSize,
    });
  }
  const dateValidation = validateTimeRange(
    config.dateRange.start,
    config.dateRange.end,
    365,
  );
  errors.push(...dateValidation.errors);
  warnings.push(...dateValidation.warnings);
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized:
      errors.length === 0 ? { ...config, dataTypes, estimatedSize } : undefined,
  };
}
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
      field: "title",
      code: "EMPTY_TITLE",
      message: "Insight title is required",
      severity: "error",
    });
  } else if (insight.title.length > 200) {
    errors.push({
      field: "title",
      code: "TITLE_TOO_LONG",
      message: "Title exceeds 200 characters",
      severity: "error",
      recoveryHint: "Shorten the title to under 200 characters",
      value: insight.title.length,
    });
  }
  if (!insight.description || insight.description.trim().length === 0) {
    errors.push({
      field: "description",
      code: "EMPTY_DESCRIPTION",
      message: "Insight description is required",
      severity: "error",
    });
  } else if (insight.description.length > 2000) {
    warnings.push({
      field: "description",
      code: "DESCRIPTION_LONG",
      message: "Description is very long",
      severity: "warning",
      recoveryHint: "Consider making the description more concise",
      value: insight.description.length,
    });
  }
  const validSeverities = [
    "info",
    "positive",
    "warning",
    "critical",
    "celebration",
  ];
  if (!validSeverities.includes(insight.severity)) {
    errors.push({
      field: "severity",
      code: "INVALID_SEVERITY",
      message: `Severity "${insight.severity}" is not valid`,
      severity: "error",
      recoveryHint: `Valid severities: ${validSeverities.join(", ")}`,
      value: insight.severity,
    });
  }
  const validMetrics = [
    "sessions_completed",
    "xp_earned",
    "streak_days",
    "boss_damage_dealt",
    "items_crafted",
  ];
  if (!validMetrics.includes(insight.metric)) {
    warnings.push({
      field: "metric",
      code: "UNKNOWN_METRIC",
      message: `Metric "${insight.metric}" may not be tracked`,
      severity: "warning",
      recoveryHint: `Tracked metrics: ${validMetrics.join(", ")}`,
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
export function validateFilter(filter: {
  dimension: string;
  operator: string;
  value: unknown;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const validOperators = ["eq", "ne", "gt", "gte", "lt", "lte", "in"];
  const validDimensions = [
    "day_of_week",
    "hour_of_day",
    "session_category",
    "streak_milestone",
    "boss_type",
    "item_type",
    "challenge_difficulty",
    "social_activity_type",
    "time_of_day",
    "device_type",
  ];
  if (!validDimensions.includes(filter.dimension)) {
    errors.push({
      field: "dimension",
      code: "INVALID_DIMENSION",
      message: `Dimension "${filter.dimension}" is not valid`,
      severity: "error",
      recoveryHint: `Valid dimensions: ${validDimensions.join(", ")}`,
      value: filter.dimension,
    });
  }
  if (!validOperators.includes(filter.operator)) {
    errors.push({
      field: "operator",
      code: "INVALID_OPERATOR",
      message: `Operator "${filter.operator}" is not valid`,
      severity: "error",
      recoveryHint: `Valid operators: ${validOperators.join(", ")}`,
      value: filter.operator,
    });
  }
  if (filter.operator === "in" && !Array.isArray(filter.value)) {
    errors.push({
      field: "value",
      code: "INVALID_VALUE_TYPE",
      message: 'Value must be an array for "in" operator',
      severity: "error",
      recoveryHint: "Provide an array of values",
      value: filter.value,
    });
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
    sanitized: errors.length === 0 ? filter : undefined,
  };
}
export async function batchValidate<T>(
  items: T[],
  validator: (item: T) => ValidationResult | Promise<ValidationResult>,
  options: {
    continueOnError?: boolean;
    maxErrors?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {},
): Promise<{
  results: Array<{ item: T; result: ValidationResult }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    errors: number;
    warnings: number;
  };
}> {
  const { continueOnError = true, maxErrors = 10, onProgress } = options;
  const results: Array<{ item: T; result: ValidationResult }> = [];
  let errorCount = 0;
  let warningCount = 0;
  let validCount = 0;
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await validator(items[i]!);
      results.push({ item: items[i]!, result });
      if (result.valid) {
        validCount++;
      } else {
        errorCount += result.errors.length;
      }
      warningCount += result.warnings.length;
      onProgress?.(i + 1, items.length);
      if (!continueOnError && errorCount >= maxErrors) {
        Sentry.addBreadcrumb({
          category: "validation",
          message: `Batch validation stopped early after ${errorCount} errors`,
          level: "warning",
        });
        break;
      }
    } catch (error) {
      results.push({
        item: items[i]!,
        result: {
          valid: false,
          errors: [
            {
              field: "unknown",
              code: "VALIDATION_EXCEPTION",
              message: error instanceof Error ? error.message : "Unknown error",
              severity: "error",
            },
          ],
          warnings: [],
        },
      });
      errorCount++;
    }
  }
  return {
    results,
    summary: {
      total: items.length,
      valid: validCount,
      invalid: items.length - validCount,
      errors: errorCount,
      warnings: warningCount,
    },
  };
}
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map((e) => {
      let msg = `[${e.severity.toUpperCase()}] ${e.field}: ${e.message}`;
      if (e.recoveryHint) {
        msg += ` (Hint: ${e.recoveryHint})`;
      }
      return msg;
    })
    .join("\n");
}
