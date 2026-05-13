

export const validateFieldDependencies = (
  fieldName: string,
  fieldValue: DynamicValue,
  formData: DynamicRecord,
  dependencies: Array<{
    field: string;
    condition: (value: DynamicValue) => boolean;
    message?: string;
  }>
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {} as Record<string, string[]>;

  for (const dependency of dependencies) {
    const dependentValue = formData[dependency.field];

    if (dependency.condition(dependentValue)) {
      if (!fieldValue || fieldValue === '') {
        const message = dependency.message || `${fieldName} is required when ${dependency.field} meets condition`;

        if (!errors[fieldName]) {
          errors[fieldName] = [];
        }
        errors[fieldName].push(message);
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

export const validateFormProgress = (
  completedFields: string[],
  totalFields: number,
  requiredFields?: string[]
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  const completionRate = (completedFields.length / totalFields) * 100;

  if (requiredFields) {
    const completedRequired = requiredFields.filter(field => completedFields.includes(field));
    const requiredCompletionRate = (completedRequired.length / requiredFields.length) * 100;

    if (requiredCompletionRate < 100) {
      warnings.progress = [`Required fields completion: ${Math.round(requiredCompletionRate)}%`];
    }
  }

  if (completionRate < 50) {
    warnings.progress = [`Form completion: ${Math.round(completionRate)}%`];
  }

  return {
    isValid: true,
    errors,
    warnings,
  };
};

export const validateMultiStepForm = (
  currentStep: number,
  totalSteps: number,
  stepData: DynamicRecord[],
  stepConfigs: FormConfig[]
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  // Validate current step
  if (currentStep >= 0 && currentStep < stepConfigs.length) {
    const currentStepConfig = stepConfigs[currentStep];
    const currentStepData = stepData[currentStep] || {};

    const stepValidation = validateForm(currentStepConfig, currentStepData);

    Object.assign(errors, stepValidation.errors);
    Object.assign(warnings, stepValidation.warnings);
  }

  // Validate step transition
  if (currentStep < 0 || currentStep >= totalSteps) {
    errors.navigation = [`Invalid step: ${currentStep}`];
  }

  // Check if previous steps are complete
  for (let i = 0; i < currentStep; i++) {
    if (stepConfigs[i] && stepData[i]) {
      const stepValidation = validateForm(stepConfigs[i], stepData[i]);
      if (!stepValidation.isValid) {
        warnings.navigation = [`Step ${i + 1} has validation errors`];
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

export const validateDynamicForm = (
  formData: DynamicRecord,
  dynamicRules: Array<{
    condition: (data: DynamicRecord) => boolean;
    validator: (data: DynamicRecord) => FormValidationResult;
    message?: string;
  }>
): FormValidationResult => {
  const allErrors: Record<string, string[]> = {};
  const allWarnings: Record<string, string[]> = {};

  for (const rule of dynamicRules) {
    if (rule.condition(formData)) {
      const result = rule.validator(formData);

      Object.keys(result.errors).forEach(fieldName => {
        if (!allErrors[fieldName]) {
          allErrors[fieldName] = [];
        }
        allErrors[fieldName].push(...result.errors[fieldName]);
      });

      Object.keys(result.warnings).forEach(fieldName => {
        if (!allWarnings[fieldName]) {
          allWarnings[fieldName] = [];
        }
        allWarnings[fieldName].push(...result.warnings[fieldName]);
      });
    }
  }

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};