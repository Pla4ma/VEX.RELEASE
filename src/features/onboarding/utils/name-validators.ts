import { createDebugger } from "../../../utils/debug";
import type { ValidationResult } from "./goal-validators";

const debug = createDebugger("onboarding:validation");

export const NameValidators = {
  validate: (name: unknown): ValidationResult<string> => {
    const result: ValidationResult<string> = {
      success: false,
      errors: [],
      warnings: [],
    };
    if (typeof name !== "string") {
      result.errors.push({
        field: "name",
        message: "Name must be a string",
        code: "INVALID_NAME_TYPE",
      });
      return result;
    }
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      result.errors.push({
        field: "name",
        message: "Name is required",
        code: "NAME_REQUIRED",
      });
      return result;
    }
    if (trimmed.length < 2) {
      result.errors.push({
        field: "name",
        message: "Name must be at least 2 characters",
        code: "NAME_TOO_SHORT",
      });
      return result;
    }
    if (trimmed.length > 30) {
      result.errors.push({
        field: "name",
        message: "Name must be 30 characters or less",
        code: "NAME_TOO_LONG",
      });
      return result;
    }
    if (!/^[a-zA-Z0-9\s_-]+$/.test(trimmed)) {
      result.errors.push({
        field: "name",
        message:
          "Name can only contain letters, numbers, spaces, hyphens, and underscores",
        code: "NAME_INVALID_CHARACTERS",
      });
      return result;
    }
    result.data = trimmed;
    result.success = true;
    if (trimmed.length < 4) {
      result.warnings.push({
        field: "name",
        message: "Consider using a longer name for better personalization",
        code: "NAME_VERY_SHORT",
      });
    }
    const testNames = ["test", "user", "name", "abc", "123"];
    if (testNames.some((tn) => trimmed.toLowerCase().includes(tn))) {
      result.warnings.push({
        field: "name",
        message:
          "This looks like a test name. Consider using your real name for a better experience.",
        code: "NAME_LIKE_TEST_DATA",
      });
    }
    debug.info("Name validated", { name: trimmed });
    return result;
  },

  generateSuggestions: (baseName: string): string[] => {
    const suggestions: string[] = [];
    if (baseName.length < 3) {
      suggestions.push(
        `${baseName}Pro`,
        `${baseName}Focus`,
        `Focus${baseName}`,
      );
    }
    if (!/[A-Z]/.test(baseName)) {
      suggestions.push(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
    return suggestions.slice(0, 3);
  },
};
