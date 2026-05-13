

export const validateForm = (config: FormConfig, formData: DynamicRecord): FormValidationResult => {
  const allErrors: Record<string, string[]> = {};
  const allWarnings: Record<string, string[]> = {};
  const sanitizedData: DynamicRecord = {};

  // Validate each field
  for (const field of config.fields) {
    const fieldResult = validateFormField(field, formData);

    // Merge errors
    Object.keys(fieldResult.errors).forEach(fieldName => {
      if (!allErrors[fieldName]) {
        allErrors[fieldName] = [];
      }
      allErrors[fieldName].push(...fieldResult.errors[fieldName]);
    });

    // Merge warnings
    Object.keys(fieldResult.warnings).forEach(fieldName => {
      if (!allWarnings[fieldName]) {
        allWarnings[fieldName] = [];
      }
      allWarnings[fieldName].push(...fieldResult.warnings[fieldName]);
    });

    // Merge sanitized data
    if (fieldResult.sanitizedData) {
      Object.assign(sanitizedData, fieldResult.sanitizedData);
    }
  }

  // Cross-field validation
  if (config.crossValidation) {
    for (const crossRule of config.crossValidation) {
      const error = crossRule.validator(sanitizedData);
      if (error) {
        // Add error to all fields involved in the cross-validation
        for (const fieldName of crossRule.fields) {
          if (!allErrors[fieldName]) {
            allErrors[fieldName] = [];
          }
          allErrors[fieldName].push(error);
        }
      }
    }
  }

  // Check if any field has dependencies that are not met
  for (const field of config.fields) {
    if (field.validation?.dependsOn && formData) {
      for (const dependency of field.validation.dependsOn) {
        if (!formData[dependency]) {
          if (!allWarnings[field.name]) {
            allWarnings[field.name] = [];
          }
          allWarnings[field.name].push(`Field depends on ${dependency} which is not provided`);
        }
      }
    }
  }

  const hasErrors = Object.keys(allErrors).some(key => allErrors[key].length > 0);

  return {
    isValid: !hasErrors,
    errors: allErrors,
    warnings: allWarnings,
    sanitizedData,
  };
};

export const validateFormState = (
  currentState: 'initial' | 'dirty' | 'validating' | 'valid' | 'invalid' | 'submitting' | 'submitted' | 'error',
  previousState?: string
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  const validStates = [
    'initial', 'dirty', 'validating', 'valid', 'invalid',
    'submitting', 'submitted', 'error',
  ];

  if (!validStates.includes(currentState)) {
    errors.formState = [`Invalid form state: ${currentState}`];
  }

  // State transition validation
  if (previousState) {
    const invalidTransitions: Record<string, string[]> = {
      'initial': ['submitting', 'submitted'],
      'dirty': ['submitted'],
      'validating': ['initial', 'dirty'],
      'valid': ['initial', 'dirty'],
      'invalid': ['submitted'],
      'submitting': ['initial', 'dirty', 'validating'],
      'submitted': ['initial', 'dirty', 'validating', 'submitting'],
      'error': ['submitted'],
    };

    if (invalidTransitions[previousState]?.includes(currentState)) {
      warnings.formState = [`Invalid state transition: ${previousState} -> ${currentState}`];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

export const validateFormSubmission = (
  formData: DynamicRecord,
  config: FormConfig,
  options: {
    validateOnSubmit?: boolean;
    sanitizeOnSubmit?: boolean;
    confirmBeforeSubmit?: boolean;
  } = {}
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  // Validate form if required
  if (options.validateOnSubmit !== false) {
    const validationResult = validateForm(config, formData);

    if (!validationResult.isValid) {
      return validationResult;
    }

    Object.assign(warnings, validationResult.warnings);
  }

  // Check for confirmation requirement
  if (options.confirmBeforeSubmit) {
    warnings.submission = ['User confirmation required before submission'];
  }

  // Check for sensitive data
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  for (const fieldName of Object.keys(formData)) {
    if (sensitiveFields.some(sensitive => fieldName.toLowerCase().includes(sensitive))) {
      warnings.security = [`Sensitive data detected in field: ${fieldName}`];
    }
  }

  // Check form size
  const formSize = JSON.stringify(formData).length;
  if (formSize > 1048576) { // 1MB
    errors.size = ['Form data is too large (maximum 1MB)'];
  } else if (formSize > 524288) { // 512KB
    warnings.size = ['Form data is large'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    sanitizedData: options.sanitizeOnSubmit ? formData : undefined,
  };
};