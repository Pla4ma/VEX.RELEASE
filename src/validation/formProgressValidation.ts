import type { FormConfig, FormValidationResult } from "./formTypes";
import { validateForm } from "./formCoreValidation";

export const validateFormProgress = (
  completedFields: string[],
  totalFields: number,
  requiredFields?: string[],
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  const completionRate = (completedFields.length / totalFields) * 100;
  if (requiredFields) {
    const completedRequired = requiredFields.filter((field) =>
      completedFields.includes(field),
    );
    const requiredCompletionRate =
      (completedRequired.length / requiredFields.length) * 100;
    if (requiredCompletionRate < 100) {
      warnings.progress = [
        `Required fields completion: ${Math.round(requiredCompletionRate)}%`,
      ];
    }
  }
  if (completionRate < 50) {
    warnings.progress = [`Form completion: ${Math.round(completionRate)}%`];
  }
  return { isValid: true, errors, warnings };
};

export const validateMultiStepForm = (
  currentStep: number,
  totalSteps: number,
  stepData: Record<string, unknown>[],
  stepConfigs: FormConfig[],
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  if (currentStep >= 0 && currentStep < stepConfigs.length) {
    const currentStepConfig = stepConfigs[currentStep]!;
    const currentStepData = stepData[currentStep] || {};
    const stepValidation = validateForm(currentStepConfig, currentStepData);
    Object.assign(errors, stepValidation.errors);
    Object.assign(warnings, stepValidation.warnings);
  }
  if (currentStep < 0 || currentStep >= totalSteps) {
    errors.navigation = [`Invalid step: ${currentStep}`];
  }
  for (let i = 0; i < currentStep; i++) {
    if (stepConfigs[i] && stepData[i]) {
      const stepValidation = validateForm(stepConfigs[i]!, stepData[i]!);
      if (!stepValidation.isValid) {
        warnings.navigation = [`Step ${i + 1} has validation errors`];
      }
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors, warnings };
};

export const validateDynamicForm = (
  formData: Record<string, unknown>,
  dynamicRules: Array<{
    condition: (data: Record<string, unknown>) => boolean;
    validator: (data: Record<string, unknown>) => FormValidationResult;
    message?: string;
  }>,
): FormValidationResult => {
  const allErrors: Record<string, string[]> = {};
  const allWarnings: Record<string, string[]> = {};
  for (const rule of dynamicRules) {
    if (rule.condition(formData)) {
      const result = rule.validator(formData);
      for (const fieldName of Object.keys(result.errors)) {
        if (!allErrors[fieldName]) {
          allErrors[fieldName] = [];
        }
        allErrors[fieldName]!.push(...(result.errors[fieldName] ?? []));
      }
      for (const fieldName of Object.keys(result.warnings)) {
        if (!allWarnings[fieldName]) {
          allWarnings[fieldName] = [];
        }
        allWarnings[fieldName]!.push(...(result.warnings[fieldName] ?? []));
      }
    }
  }
  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};
