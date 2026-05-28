import type { FormConfig, FormValidationResult } from "./formTypes";
import { validateFormField } from "./formFieldValidation";

export const validateForm = (
  config: FormConfig,
  formData: Record<string, unknown>,
): FormValidationResult => {
  const allErrors: Record<string, string[]> = {};
  const allWarnings: Record<string, string[]> = {};
  const sanitizedData: Record<string, unknown> = {};
  for (const field of config.fields) {
    const fieldResult = validateFormField(field, formData);
    Object.keys(fieldResult.errors).forEach((fieldName) => {
      if (!allErrors[fieldName]) {
        allErrors[fieldName] = [];
      }
      allErrors[fieldName].push(...(fieldResult.errors[fieldName] ?? []));
    });
    Object.keys(fieldResult.warnings).forEach((fieldName) => {
      if (!allWarnings[fieldName]) {
        allWarnings[fieldName] = [];
      }
      allWarnings[fieldName].push(...(fieldResult.warnings[fieldName] ?? []));
    });
    if (fieldResult.sanitizedData) {
      Object.assign(sanitizedData, fieldResult.sanitizedData);
    }
  }
  if (config.crossValidation) {
    for (const crossRule of config.crossValidation) {
      const error = crossRule.validator(sanitizedData);
      if (error) {
        for (const fieldName of crossRule.fields) {
          if (!allErrors[fieldName]) {
            allErrors[fieldName] = [];
          }
          allErrors[fieldName].push(error);
        }
      }
    }
  }
  for (const field of config.fields) {
    if (field.validation?.dependsOn && formData) {
      for (const dependency of field.validation.dependsOn) {
        if (!formData[dependency]) {
          if (!allWarnings[field.name]) {
            allWarnings[field.name] = [];
          }
          allWarnings[field.name]!.push(
            `Field depends on ${dependency} which is not provided`,
          );
        }
      }
    }
  }
  const hasErrors = Object.keys(allErrors).some(
    (key) => (allErrors[key]?.length ?? 0) > 0,
  );
  return {
    isValid: !hasErrors,
    errors: allErrors,
    warnings: allWarnings,
    sanitizedData,
  };
};

export const validateFormState = (
  currentState:
    | "initial"
    | "dirty"
    | "validating"
    | "valid"
    | "invalid"
    | "submitting"
    | "submitted"
    | "error",
  previousState?: string,
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  const validStates = [
    "initial",
    "dirty",
    "validating",
    "valid",
    "invalid",
    "submitting",
    "submitted",
    "error",
  ];
  if (!validStates.includes(currentState)) {
    errors.formState = [`Invalid form state: ${currentState}`];
  }
  if (previousState) {
    const invalidTransitions: Record<string, string[]> = {
      initial: ["submitting", "submitted"],
      dirty: ["submitted"],
      validating: ["initial", "dirty"],
      valid: ["initial", "dirty"],
      invalid: ["submitted"],
      submitting: ["initial", "dirty", "validating"],
      submitted: ["initial", "dirty", "validating", "submitting"],
      error: ["submitted"],
    };
    if (invalidTransitions[previousState]?.includes(currentState)) {
      warnings.formState = [
        `Invalid state transition: ${previousState} -> ${currentState}`,
      ];
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors, warnings };
};
