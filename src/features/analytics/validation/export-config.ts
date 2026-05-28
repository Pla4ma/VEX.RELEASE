import type { ValidationError, ValidationResult } from "./types";
import { validateTimeRange } from "./time-range";

const VALID_FORMATS = ["json", "csv"] as const;
const VALID_DATA_TYPES = [
  "sessions",
  "xp",
  "streaks",
  "boss",
  "items",
  "challenges",
] as const;

export function validateExportConfig(config: {
  format: string;
  dataTypes?: string[];
  dateRange: { start: number; end: number };
  userId: string;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!(VALID_FORMATS as readonly string[]).includes(config.format)) {
    errors.push({
      field: "format",
      code: "INVALID_FORMAT",
      message: `Export format "${config.format}" is not supported`,
      severity: "error",
      recoveryHint: `Supported formats: ${VALID_FORMATS.join(", ")}`,
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

  const dataTypes = config.dataTypes || [...VALID_DATA_TYPES];
  for (const type of dataTypes) {
    if (!(VALID_DATA_TYPES as readonly string[]).includes(type)) {
      warnings.push({
        field: "dataTypes",
        code: "UNKNOWN_DATA_TYPE",
        message: `Data type "${type}" may not be available`,
        severity: "warning",
        recoveryHint: `Available types: ${VALID_DATA_TYPES.join(", ")}`,
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
