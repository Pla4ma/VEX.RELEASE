import type { DataValidationResult, ValidationRule } from "./dataValidation-types";

export const validateString = (
  value: unknown,
  rules: Partial<ValidationRule> = {},
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;
  if (typeof value !== "string") {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push("Value is required");
      }
    } else {
      errors.push("Value must be a string");
      sanitizedValue = String(value);
      warnings.push("Value was converted to string");
    }
  }
  if (typeof sanitizedValue !== "string") {
    return { isValid: false, errors, warnings };
  }
  if (rules.required && sanitizedValue.trim().length === 0) {
    errors.push("Value cannot be empty");
  }
  if (rules.minLength !== undefined && sanitizedValue.length < rules.minLength) {
    errors.push(`Value must be at least ${rules.minLength} characters long`);
  }
  if (rules.maxLength !== undefined && sanitizedValue.length > rules.maxLength) {
    errors.push(`Value must be no more than ${rules.maxLength} characters long`);
    sanitizedValue = sanitizedValue.substring(0, rules.maxLength);
    warnings.push("Value was truncated to maximum length");
  }
  if (rules.pattern && !rules.pattern.test(sanitizedValue as string)) {
    errors.push("Value does not match required pattern");
  }
  if (rules.enum && !rules.enum.includes(sanitizedValue as string)) {
    errors.push(`Value must be one of: ${rules.enum.join(", ")}`);
  }
  if (rules.custom) {
    const customError = rules.custom(sanitizedValue);
    if (customError) {
      errors.push(customError);
    }
  }
  sanitizedValue = (sanitizedValue as string).trim();
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedValue,
  };
};

export const validateNumber = (
  value: unknown,
  rules: Partial<ValidationRule> = {},
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;
  if (typeof value !== "number") {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push("Value is required");
      }
    } else if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        errors.push("Value must be a number");
      } else {
        sanitizedValue = parsed;
        warnings.push("String value was converted to number");
      }
    } else {
      errors.push("Value must be a number");
    }
  }
  if (typeof sanitizedValue !== "number") {
    return { isValid: false, errors, warnings };
  }
  if (rules.min !== undefined && sanitizedValue < rules.min) {
    errors.push(`Value must be at least ${rules.min}`);
  }
  if (rules.max !== undefined && sanitizedValue > rules.max) {
    errors.push(`Value must be no more than ${rules.max}`);
  }
  if (rules.type === "number" && !Number.isInteger(sanitizedValue)) {
    warnings.push("Value is not an integer");
  }
  if (rules.enum && !rules.enum.includes(sanitizedValue)) {
    errors.push(`Value must be one of: ${rules.enum.join(", ")}`);
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
