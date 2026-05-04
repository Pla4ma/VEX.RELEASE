/**
 * Form Validation Layer
 * 
 * Comprehensive validation for form data including field validation,
 * cross-field validation, form state management, and user experience
 * considerations.
 */

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  sanitizedData?: Record<string, any>;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  value: any;
  required?: boolean;
  label?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  options?: string[];
  validation?: {
    custom?: (value: any, formData?: Record<string, any>) => string | null;
    dependsOn?: string[];
    compareWith?: string;
    message?: string;
  };
}

export interface FormConfig {
  fields: FormField[];
  crossValidation?: Array<{
    fields: string[];
    validator: (values: Record<string, any>) => string | null;
    message: string;
  }>;
  submitButton?: {
    text: string;
    disabled?: boolean;
    loading?: boolean;
  };
}

// Single field validation
export const validateFormField = (field: FormField, formData?: Record<string, any>): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  const fieldErrors: string[] = [];
  const fieldWarnings: string[] = [];
  let sanitizedValue = field.value;

  // Required validation
  if (field.required) {
    if (field.value === null || field.value === undefined || field.value === '') {
      fieldErrors.push(`${field.label || field.name} is required`);
    }
  }

  // Skip further validation if field is empty and not required
  if (!field.value && !field.required) {
    return {
      isValid: true,
      errors: {},
      warnings: {},
      sanitizedData: { [field.name]: field.value },
    };
  }

  // Type-specific validation
  switch (field.type) {
    case 'text':
    case 'textarea':
      if (typeof field.value !== 'string') {
        fieldErrors.push(`${field.label || field.name} must be text`);
        sanitizedValue = String(field.value);
        fieldWarnings.push('Value was converted to string');
      }

      const stringValue = String(sanitizedValue);

      // Length validation
      if (field.minLength && stringValue.length < field.minLength) {
        fieldErrors.push(`${field.label || field.name} must be at least ${field.minLength} characters`);
      }

      if (field.maxLength && stringValue.length > field.maxLength) {
        fieldErrors.push(`${field.label || field.name} must be no more than ${field.maxLength} characters`);
        sanitizedValue = stringValue.substring(0, field.maxLength);
        fieldWarnings.push('Value was truncated to maximum length');
      }

      // Pattern validation
      if (field.pattern && !field.pattern.test(stringValue)) {
        fieldErrors.push(`${field.label || field.name} format is invalid`);
      }

      // Email validation for email type
      if (field.type === 'email' || field.name.toLowerCase().includes('email')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(stringValue)) {
          fieldErrors.push('Invalid email format');
        }
      }

      // Phone validation for phone type
      if (field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('tel')) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        const digitsOnly = stringValue.replace(/\D/g, '');
        
        if (!phoneRegex.test(stringValue)) {
          fieldErrors.push('Invalid phone number format');
        }
        
        if (digitsOnly.length < 10) {
          fieldErrors.push('Phone number must have at least 10 digits');
        }
      }

      break;

    case 'email':
      if (typeof field.value !== 'string') {
        fieldErrors.push(`${field.label || field.name} must be text`);
        sanitizedValue = String(field.value);
      }

      const emailValue = String(sanitizedValue);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(emailValue)) {
        fieldErrors.push('Invalid email format');
      }

      if (emailValue.length > 254) {
        fieldErrors.push('Email is too long');
      }

      break;

    case 'password':
      if (typeof field.value !== 'string') {
        fieldErrors.push(`${field.label || field.name} must be text`);
      }

      const passwordValue = String(field.value);

      if (passwordValue.length < 8) {
        fieldErrors.push('Password must be at least 8 characters long');
      }

      if (passwordValue.length > 128) {
        fieldErrors.push('Password is too long');
      }

      if (!/[A-Z]/.test(passwordValue)) {
        fieldErrors.push('Password must contain at least one uppercase letter');
      }

      if (!/[a-z]/.test(passwordValue)) {
        fieldErrors.push('Password must contain at least one lowercase letter');
      }

      if (!/\d/.test(passwordValue)) {
        fieldErrors.push('Password must contain at least one number');
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue)) {
        fieldErrors.push('Password must contain at least one special character');
      }

      // Check for common passwords
      const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
      if (commonPasswords.some(common => passwordValue.toLowerCase().includes(common))) {
        fieldErrors.push('Password contains common patterns');
      }

      break;

    case 'number':
      let numValue = field.value;

      if (typeof field.value === 'string') {
        const parsed = parseFloat(field.value);
        if (isNaN(parsed)) {
          fieldErrors.push(`${field.label || field.name} must be a number`);
        } else {
          numValue = parsed;
          fieldWarnings.push('String value was converted to number');
        }
      } else if (typeof field.value !== 'number') {
        fieldErrors.push(`${field.label || field.name} must be a number`);
      }

      if (typeof numValue === 'number') {
        if (field.min !== undefined && numValue < field.min) {
          fieldErrors.push(`${field.label || field.name} must be at least ${field.min}`);
        }

        if (field.max !== undefined && numValue > field.max) {
          fieldErrors.push(`${field.label || field.name} must be no more than ${field.max}`);
        }
      }

      sanitizedValue = numValue;
      break;

    case 'date':
      let dateValue = field.value;

      if (!(field.value instanceof Date)) {
        if (typeof field.value === 'string') {
          const parsed = new Date(field.value);
          if (isNaN(parsed.getTime())) {
            fieldErrors.push(`${field.label || field.name} must be a valid date`);
          } else {
            dateValue = parsed;
            fieldWarnings.push('String value was converted to date');
          }
        } else {
          fieldErrors.push(`${field.label || field.name} must be a date`);
        }
      }

      if (dateValue instanceof Date) {
        const now = new Date();
        
        if (field.min !== undefined) {
          const minDate = new Date(field.min);
          if (dateValue < minDate) {
            fieldErrors.push(`${field.label || field.name} must be after ${minDate.toLocaleDateString()}`);
          }
        }

        if (field.max !== undefined) {
          const maxDate = new Date(field.max);
          if (dateValue > maxDate) {
            fieldErrors.push(`${field.label || field.name} must be before ${maxDate.toLocaleDateString()}`);
          }
        }

        // Date range warnings
        if (dateValue > now && !field.max) {
          fieldWarnings.push('Date is in the future');
        }

        if (dateValue < now && !field.min) {
          fieldWarnings.push('Date is in the past');
        }
      }

      sanitizedValue = dateValue;
      break;

    case 'select':
      if (field.options && !field.options.includes(field.value)) {
        fieldErrors.push(`${field.label || field.name} must be one of the available options`);
      }

      if (field.required && !field.value) {
        fieldErrors.push(`${field.label || field.name} is required`);
      }

      break;

    case 'checkbox':
      if (typeof field.value !== 'boolean') {
        fieldErrors.push(`${field.label || field.name} must be true or false`);
      }

      if (field.required && !field.value) {
        fieldErrors.push(`${field.label || field.name} must be checked`);
      }

      break;

    case 'radio':
      if (field.options && !field.options.includes(field.value)) {
        fieldErrors.push(`${field.label || field.name} must be one of the available options`);
      }

      if (field.required && !field.value) {
        fieldErrors.push(`${field.label || field.name} is required`);
      }

      break;
  }

  // Custom validation
  if (field.validation?.custom) {
    const customError = field.validation.custom(sanitizedValue, formData);
    if (customError) {
      fieldErrors.push(customError);
    }
  }

  // Compare with another field
  if (field.validation?.compareWith && formData) {
    const compareValue = formData[field.validation.compareWith];
    if (compareValue !== undefined && sanitizedValue !== compareValue) {
      fieldErrors.push(field.validation.message || `${field.label || field.name} does not match ${field.validation.compareWith}`);
    }
  }

  // Collect errors and warnings
  if (fieldErrors.length > 0) {
    errors[field.name] = fieldErrors;
  }

  if (fieldWarnings.length > 0) {
    warnings[field.name] = fieldWarnings;
  }

  return {
    isValid: fieldErrors.length === 0,
    errors,
    warnings,
    sanitizedData: { [field.name]: sanitizedValue },
  };
};

// Complete form validation
export const validateForm = (config: FormConfig, formData: Record<string, any>): FormValidationResult => {
  const allErrors: Record<string, string[]> = {};
  const allWarnings: Record<string, string[]> = {};
  const sanitizedData: Record<string, any> = {};

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

// Form state validation
export const validateFormState = (
  currentState: 'initial' | 'dirty' | 'validating' | 'valid' | 'invalid' | 'submitting' | 'submitted' | 'error',
  previousState?: string
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  const validStates = [
    'initial', 'dirty', 'validating', 'valid', 'invalid', 
    'submitting', 'submitted', 'error'
  ];

  if (!validStates.includes(currentState)) {
    errors['formState'] = [`Invalid form state: ${currentState}`];
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
      warnings['formState'] = [`Invalid state transition: ${previousState} -> ${currentState}`];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

// Form submission validation
export const validateFormSubmission = (
  formData: Record<string, any>,
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
    warnings['submission'] = ['User confirmation required before submission'];
  }

  // Check for sensitive data
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  for (const fieldName of Object.keys(formData)) {
    if (sensitiveFields.some(sensitive => fieldName.toLowerCase().includes(sensitive))) {
      warnings['security'] = [`Sensitive data detected in field: ${fieldName}`];
    }
  }

  // Check form size
  const formSize = JSON.stringify(formData).length;
  if (formSize > 1048576) { // 1MB
    errors['size'] = ['Form data is too large (maximum 1MB)'];
  } else if (formSize > 524288) { // 512KB
    warnings['size'] = ['Form data is large'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    sanitizedData: options.sanitizeOnSubmit ? formData : undefined,
  };
};

// Field dependency validation
export const validateFieldDependencies = (
  fieldName: string,
  fieldValue: any,
  formData: Record<string, any>,
  dependencies: Array<{
    field: string;
    condition: (value: any) => boolean;
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

// Form progress validation
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
      warnings['progress'] = [`Required fields completion: ${Math.round(requiredCompletionRate)}%`];
    }
  }

  if (completionRate < 50) {
    warnings['progress'] = [`Form completion: ${Math.round(completionRate)}%`];
  }

  return {
    isValid: true,
    errors,
    warnings,
  };
};

// Multi-step form validation
export const validateMultiStepForm = (
  currentStep: number,
  totalSteps: number,
  stepData: Record<string, any>[],
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
    errors['navigation'] = [`Invalid step: ${currentStep}`];
  }

  // Check if previous steps are complete
  for (let i = 0; i < currentStep; i++) {
    if (stepConfigs[i] && stepData[i]) {
      const stepValidation = validateForm(stepConfigs[i], stepData[i]);
      if (!stepValidation.isValid) {
        warnings['navigation'] = [`Step ${i + 1} has validation errors`];
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

// Dynamic form validation
export const validateDynamicForm = (
  formData: Record<string, any>,
  dynamicRules: Array<{
    condition: (data: Record<string, any>) => boolean;
    validator: (data: Record<string, any>) => FormValidationResult;
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
