

export const validateFormField = (field: FormField, formData?: DynamicRecord): FormValidationResult => {
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
      if ((field.type as any) === 'email' || field.name.toLowerCase().includes('email')) {
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