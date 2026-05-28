import { captureSilentFailure } from "../../utils/silent-failure";
import type { ValidationError } from "./validation-types";

export function validateNotificationSetting(
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

export function validateAppearanceSetting(
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
