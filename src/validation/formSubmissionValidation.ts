import type { FormConfig, FormValidationResult } from "./formTypes";
import { validateForm } from "./formCoreValidation";

export const validateFormSubmission = (
  formData: Record<string, unknown>,
  config: FormConfig,
  options: {
    validateOnSubmit?: boolean;
    sanitizeOnSubmit?: boolean;
    confirmBeforeSubmit?: boolean;
  } = {},
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  if (options.validateOnSubmit !== false) {
    const validationResult = validateForm(config, formData);
    if (!validationResult.isValid) {
      return validationResult;
    }
    Object.assign(warnings, validationResult.warnings);
  }
  if (options.confirmBeforeSubmit) {
    warnings.submission = ["User confirmation required before submission"];
  }
  const sensitiveFields = ["password", "token", "secret", "key"];
  for (const fieldName of Object.keys(formData)) {
    if (
      sensitiveFields.some((sensitive) =>
        fieldName.toLowerCase().includes(sensitive),
      )
    ) {
      warnings.security = [`Sensitive data detected in field: ${fieldName}`];
    }
  }
  const formSize = JSON.stringify(formData).length;
  if (formSize > 1048576) {
    errors.size = ["Form data is too large (maximum 1MB)"];
  } else if (formSize > 524288) {
    warnings.size = ["Form data is large"];
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    sanitizedData: options.sanitizeOnSubmit ? formData : undefined,
  };
};

export const validateFieldDependencies = (
  fieldName: string,
  fieldValue: unknown,
  formData: Record<string, unknown>,
  dependencies: Array<{
    field: string;
    condition: (value: unknown) => boolean;
    message?: string;
  }>,
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {} as Record<string, string[]>;
  for (const dependency of dependencies) {
    const dependentValue = formData[dependency.field];
    if (dependency.condition(dependentValue)) {
      if (!fieldValue || fieldValue === "") {
        const message =
          dependency.message ||
          `${fieldName} is required when ${dependency.field} meets condition`;
        if (!errors[fieldName]) {
          errors[fieldName] = [];
        }
        errors[fieldName].push(message);
      }
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors, warnings };
};
