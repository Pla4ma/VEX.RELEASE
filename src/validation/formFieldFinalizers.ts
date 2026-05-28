import type { FormField, FormValidationResult } from "./formTypes";

export const applyCustomFieldValidation = (
  field: FormField,
  sanitizedValue: unknown,
  formData: Record<string, unknown> | undefined,
  fieldErrors: string[],
): void => {
  if (field.validation?.custom) {
    const customError = field.validation.custom(sanitizedValue, formData);
    if (customError) {
      fieldErrors.push(customError);
    }
  }
  if (field.validation?.compareWith && formData) {
    const compareValue = formData[field.validation.compareWith];
    if (compareValue !== undefined && sanitizedValue !== compareValue) {
      fieldErrors.push(
        field.validation.message ||
          `${field.label || field.name} does not match ${field.validation.compareWith}`,
      );
    }
  }
};

export const buildFieldValidationResult = (
  fieldName: string,
  fieldErrors: string[],
  fieldWarnings: string[],
  sanitizedValue: unknown,
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  if (fieldErrors.length > 0) {
    errors[fieldName] = fieldErrors;
  }
  if (fieldWarnings.length > 0) {
    warnings[fieldName] = fieldWarnings;
  }
  return {
    isValid: fieldErrors.length === 0,
    errors,
    warnings,
    sanitizedData: { [fieldName]: sanitizedValue },
  };
};
