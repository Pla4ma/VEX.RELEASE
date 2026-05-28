import type { DataValidationResult, ValidationRule } from "./dataValidation-types";

export const validateBoolean = (
  value: unknown,
  rules: Partial<ValidationRule> = {},
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;
  if (typeof value !== "boolean") {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push("Value is required");
      }
    } else if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      if (lowerValue === "true" || lowerValue === "1" || lowerValue === "yes") {
        sanitizedValue = true;
        warnings.push("String value was converted to boolean");
      } else if (lowerValue === "false" || lowerValue === "0" || lowerValue === "no") {
        sanitizedValue = false;
        warnings.push("String value was converted to boolean");
      } else {
        errors.push("Value must be a boolean or recognized string");
      }
    } else if (typeof value === "number") {
      sanitizedValue = value !== 0;
      warnings.push("Number value was converted to boolean");
    } else {
      errors.push("Value must be a boolean");
    }
  }
  if (typeof sanitizedValue !== "boolean") {
    return { isValid: false, errors, warnings };
  }
  if (rules.custom) {
    const customError = rules.custom(sanitizedValue);
    if (customError) {
      errors.push(customError);
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedValue,
  };
};

export const validateDate = (
  value: unknown,
  rules: Partial<ValidationRule> = {},
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;
  if (!(value instanceof Date)) {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push("Value is required");
      }
    } else if (typeof value === "string") {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        errors.push("Invalid date format");
      } else {
        sanitizedValue = parsed;
        warnings.push("String value was converted to date");
      }
    } else if (typeof value === "number") {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        errors.push("Invalid timestamp");
      } else {
        sanitizedValue = parsed;
        warnings.push("Number value was converted to date");
      }
    } else {
      errors.push("Value must be a date");
    }
  }
  if (!(sanitizedValue instanceof Date)) {
    return { isValid: false, errors, warnings };
  }
  const now = new Date();
  if (rules.min !== undefined) {
    const minDate = new Date(rules.min);
    if (sanitizedValue < minDate) {
      errors.push(`Date must be after ${minDate.toISOString()}`);
    }
  }
  if (rules.max !== undefined) {
    const maxDate = new Date(rules.max);
    if (sanitizedValue > maxDate) {
      errors.push(`Date must be before ${maxDate.toISOString()}`);
    }
  }
  if (sanitizedValue > now && !rules.max) {
    warnings.push("Date is in the future");
  }
  if (sanitizedValue < now && !rules.min) {
    warnings.push("Date is in the past");
  }
  if (rules.custom) {
    const customError = rules.custom(sanitizedValue);
    if (customError) {
      errors.push(customError);
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedValue,
  };
};
