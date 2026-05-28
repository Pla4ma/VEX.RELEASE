import { z } from "zod";
import * as Sentry from "@sentry/react-native";
import { SettingCategorySchema } from "./schemas";
import type { ValidationResult, ValidationError } from "./validation-types";
import { validateNotificationSetting, validateAppearanceSetting } from "./validation-notification";
import { validateCoachSetting, validatePrivacySetting, validateGeneralSetting, validateDataSetting } from "./validation-preference";

// Re-export types and class for backward compatibility
export type { ValidationResult, ValidationError } from "./validation-types";
export { SettingsValidationError } from "./validation-types";

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
