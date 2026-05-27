import { captureSilentFailure } from "../../utils/silent-failure";
import { z } from "zod";
import * as Sentry from "@sentry/react-native";
import {
  SettingCategorySchema,
  NotificationChannelSchema,
  NotificationPrioritySchema,
  CoachPersonalitySchema,
  CoachFrequencySchema,
  ThemeModeSchema,
  DataRetentionPolicySchema,
  ExportFormatSchema,
  SettingValueSchema,
} from "./schemas";
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  sanitized?: unknown;
}
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning";
  recoveryHint?: string;
}
export class SettingsValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string,
    public recoveryHint?: string,
  ) {
    super(message);
    this.name = "SettingsValidationError";
  }
}
export function validateSettingValue(
  key: string,
  value: unknown,
  category: z.infer<typeof SettingCategorySchema>,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (value === undefined) {
    errors.push({
      field: key,
      code: "UNDEFINED_VALUE",
      message: `Value for "${key}" cannot be undefined`,
      severity: "error",
      recoveryHint: "Provide a valid value or use null",
    });
    return { valid: false, errors, warnings };
  }
  switch (category) {
    case "notifications":
      validateNotificationSetting(key, value, errors, warnings);
      break;
    case "appearance":
      validateAppearanceSetting(key, value, errors, warnings);
      break;
    case "coach":
      validateCoachSetting(key, value, errors, warnings);
      break;
    case "privacy":
      validatePrivacySetting(key, value, errors, warnings);
      break;
    case "general":
      validateGeneralSetting(key, value, errors, warnings);
      break;
    case "data":
      validateDataSetting(key, value, errors, warnings);
      break;
  }
  if (!key.includes(".")) {
    warnings.push({
      field: key,
      code: "INVALID_KEY_FORMAT",
      message: 'Setting key should use dot notation (e.g., "category.setting")',
      severity: "warning",
      recoveryHint: 'Use format: "category.settingName"',
    });
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: errors.length === 0 ? value : undefined,
  };
}
function validateNotificationSetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes("digestFrequency") && typeof value === "string") {
    const validFrequencies = ["immediate", "daily", "weekly", "never"];
    if (!validFrequencies.includes(value)) {
      errors.push({
        field: key,
        code: "INVALID_FREQUENCY",
        message: `Invalid digest frequency: ${value}`,
        severity: "error",
        recoveryHint: `Valid frequencies: ${validFrequencies.join(", ")}`,
      });
    }
  }
  if (key.includes("quietHours") && value !== null && value !== undefined) {
    const hour = Number(value);
    if (Number.isNaN(hour) || hour < 0 || hour > 23) {
      errors.push({
        field: key,
        code: "INVALID_HOUR",
        message: "Quiet hours must be between 0 and 23",
        severity: "error",
        recoveryHint: "Use 24-hour format (0-23)",
      });
    }
  }
  if (key.includes("deviceTokens") && Array.isArray(value)) {
    if (value.length > 10) {
      warnings.push({
        field: key,
        code: "TOO_MANY_DEVICE_TOKENS",
        message: "More than 10 device tokens registered",
        severity: "warning",
        recoveryHint: "Remove old or unused device tokens",
      });
    }
  }
  if (key.includes("timezone") && typeof value === "string") {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
    } catch (error) {
      captureSilentFailure(error, {
        feature: "settings",
        operation: "safe-fallback",
        type: "data",
      });
      warnings.push({
        field: key,
        code: "INVALID_TIMEZONE",
        message: `Timezone "${value}" may not be valid`,
        severity: "warning",
        recoveryHint: 'Use IANA timezone format (e.g., "America/New_York")',
      });
    }
  }
}
function validateAppearanceSetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes("fontScale") && typeof value === "number") {
    if (value < 0.5 || value > 2) {
      errors.push({
        field: key,
        code: "INVALID_FONT_SCALE",
        message: `Font scale ${value} is outside valid range`,
        severity: "error",
        recoveryHint: "Use value between 0.5 and 2.0",
      });
    }
    if (value > 1.5) {
      warnings.push({
        field: key,
        code: "LARGE_FONT_SCALE",
        message: "Large font scale may affect layout",
        severity: "warning",
      });
    }
  }
  if (key.includes("theme") && typeof value === "string") {
    const validThemes = ["light", "dark", "system"];
    if (!validThemes.includes(value)) {
      errors.push({
        field: key,
        code: "INVALID_THEME",
        message: `Theme "${value}" is not valid`,
        severity: "error",
        recoveryHint: `Valid themes: ${validThemes.join(", ")}`,
      });
    }
  }
  if (key.includes("accentColor") && typeof value === "string") {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(value)) {
      errors.push({
        field: key,
        code: "INVALID_COLOR",
        message: "Accent color must be a valid hex code",
        severity: "error",
        recoveryHint:
          "Use six hex digits with a leading hash, for example 6366f1",
      });
    }
  }
}
function validateCoachSetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes("personality") && typeof value === "string") {
    const validPersonalities = ["supportive", "tough", "neutral", "funny"];
    if (!validPersonalities.includes(value)) {
      errors.push({
        field: key,
        code: "INVALID_PERSONALITY",
        message: `Coach personality "${value}" is not valid`,
        severity: "error",
        recoveryHint: `Valid personalities: ${validPersonalities.join(", ")}`,
      });
    }
  }
  if (key.includes("frequency") && typeof value === "string") {
    const validFrequencies = ["minimal", "moderate", "frequent", "constant"];
    if (!validFrequencies.includes(value)) {
      errors.push({
        field: key,
        code: "INVALID_FREQUENCY",
        message: `Coach frequency "${value}" is not valid`,
        severity: "error",
        recoveryHint: `Valid frequencies: ${validFrequencies.join(", ")}`,
      });
    }
  }
  if (
    (key.includes("quietHours") && key.includes("start")) ||
    key.includes("end")
  ) {
    if (typeof value === "string") {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) {
        errors.push({
          field: key,
          code: "INVALID_TIME_FORMAT",
          message: "Time must be in HH:MM format",
          severity: "error",
          recoveryHint: 'Use 24-hour format (e.g., "22:00")',
        });
      }
    }
  }
}
function validatePrivacySetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes("profileVisibility") && typeof value === "string") {
    const validVisibilities = ["public", "friends", "private"];
    if (!validVisibilities.includes(value)) {
      errors.push({
        field: key,
        code: "INVALID_VISIBILITY",
        message: `Profile visibility "${value}" is not valid`,
        severity: "error",
        recoveryHint: `Valid options: ${validVisibilities.join(", ")}`,
      });
    }
  }
  if (key.includes("analyticsOptOut") && value === true) {
    warnings.push({
      field: key,
      code: "ANALYTICS_DISABLED",
      message: "Analytics disabled - app improvements may be affected",
      severity: "warning",
      recoveryHint: "Consider enabling analytics to help improve the app",
    });
  }
}
function validateGeneralSetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes("language") && typeof value === "string") {
    const validLanguages = ["en", "es", "fr", "de", "ja", "zh"];
    if (!validLanguages.includes(value)) {
      warnings.push({
        field: key,
        code: "UNSUPPORTED_LANGUAGE",
        message: `Language "${value}" may not be fully supported`,
        severity: "warning",
        recoveryHint: `Supported languages: ${validLanguages.join(", ")}`,
      });
    }
  }
}
function validateDataSetting(
  key: string,
  value: unknown,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (key.includes("retentionPolicy") && typeof value === "string") {
    const validPolicies = ["minimal", "standard", "comprehensive", "forever"];
    if (!validPolicies.includes(value)) {
      errors.push({
        field: key,
        code: "INVALID_RETENTION_POLICY",
        message: `Retention policy "${value}" is not valid`,
        severity: "error",
        recoveryHint: `Valid policies: ${validPolicies.join(", ")}`,
      });
    }
  }
  if (key.includes("autoExport.frequency") && typeof value === "string") {
    const validFrequencies = ["weekly", "monthly", "never"];
    if (!validFrequencies.includes(value)) {
      errors.push({
        field: key,
        code: "INVALID_EXPORT_FREQUENCY",
        message: `Export frequency "${value}" is not valid`,
        severity: "error",
        recoveryHint: `Valid frequencies: ${validFrequencies.join(", ")}`,
      });
    }
  }
}
export function validateSettingsExport(
  exportData: Record<string, unknown>,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!exportData.version) {
    errors.push({
      field: "version",
      code: "MISSING_VERSION",
      message: "Export data missing version field",
      severity: "error",
    });
  } else if (typeof exportData.version !== "number" || exportData.version < 1) {
    errors.push({
      field: "version",
      code: "INVALID_VERSION",
      message: "Export version must be a positive number",
      severity: "error",
    });
  }
  if (!exportData.userId) {
    errors.push({
      field: "userId",
      code: "MISSING_USER_ID",
      message: "Export data missing userId",
      severity: "error",
    });
  }
  if (!exportData.exportedAt) {
    warnings.push({
      field: "exportedAt",
      code: "MISSING_TIMESTAMP",
      message: "Export data missing timestamp",
      severity: "warning",
    });
  }
  if (exportData.preferences) {
    if (typeof exportData.preferences !== "object") {
      errors.push({
        field: "preferences",
        code: "INVALID_PREFERENCES",
        message: "Preferences must be an object",
        severity: "error",
      });
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: errors.length === 0 ? exportData : undefined,
  };
}
export async function batchValidateSettings(
  settings: Array<{
    key: string;
    value: unknown;
    category: z.infer<typeof SettingCategorySchema>;
  }>,
  options: { continueOnError?: boolean; maxErrors?: number } = {},
): Promise<{
  results: Array<{ key: string; result: ValidationResult }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    errors: number;
    warnings: number;
  };
}> {
  const { continueOnError = true, maxErrors = 10 } = options;
  const results: Array<{ key: string; result: ValidationResult }> = [];
  let errorCount = 0;
  let warningCount = 0;
  let validCount = 0;
  for (const setting of settings) {
    const result = validateSettingValue(
      setting.key,
      setting.value,
      setting.category,
    );
    results.push({ key: setting.key, result });
    if (result.valid) {
      validCount++;
    } else {
      errorCount += result.errors.length;
    }
    warningCount += result.warnings.length;
    if (!continueOnError && errorCount >= maxErrors) {
      Sentry.addBreadcrumb({
        category: "validation",
        message: `Batch validation stopped early after ${errorCount} errors`,
        level: "warning",
      });
      break;
    }
  }
  return {
    results,
    summary: {
      total: settings.length,
      valid: validCount,
      invalid: settings.length - validCount,
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
        msg += `\n  Hint: ${e.recoveryHint}`;
      }
      return msg;
    })
    .join("\n");
}
