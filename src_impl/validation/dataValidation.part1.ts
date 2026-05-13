

export const validateString = (
  value: DynamicValue,
  rules: Partial<ValidationRule> = {}
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;

  // Type check
  if (typeof value !== 'string') {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push('Value is required');
      }
    } else {
      errors.push('Value must be a string');
      sanitizedValue = String(value);
      warnings.push('Value was converted to string');
    }
  }

  if (typeof sanitizedValue !== 'string') {
    return { isValid: false, errors, warnings };
  }

  // Required check
  if (rules.required && sanitizedValue.trim().length === 0) {
    errors.push('Value cannot be empty');
  }

  // Length validation
  if (rules.minLength !== undefined && sanitizedValue.length < rules.minLength) {
    errors.push(`Value must be at least ${rules.minLength} characters long`);
  }

  if (rules.maxLength !== undefined && sanitizedValue.length > rules.maxLength) {
    errors.push(`Value must be no more than ${rules.maxLength} characters long`);
    sanitizedValue = sanitizedValue.substring(0, rules.maxLength);
    warnings.push('Value was truncated to maximum length');
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
    errors.push('Value does not match required pattern');
  }

  // Enum validation
  if (rules.enum && !rules.enum.includes(sanitizedValue)) {
    errors.push(`Value must be one of: ${rules.enum.join(', ')}`);
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(sanitizedValue);
    if (customError) {
      errors.push(customError);
    }
  }

  // Sanitization
  sanitizedValue = sanitizedValue.trim();

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedValue,
  };
};

export const validateNumber = (
  value: DynamicValue,
  rules: Partial<ValidationRule> = {}
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;

  // Type check and conversion
  if (typeof value !== 'number') {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push('Value is required');
      }
    } else if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        errors.push('Value must be a number');
      } else {
        sanitizedValue = parsed;
        warnings.push('String value was converted to number');
      }
    } else {
      errors.push('Value must be a number');
    }
  }

  if (typeof sanitizedValue !== 'number') {
    return { isValid: false, errors, warnings };
  }

  // Range validation
  if (rules.min !== undefined && sanitizedValue < rules.min) {
    errors.push(`Value must be at least ${rules.min}`);
  }

  if (rules.max !== undefined && sanitizedValue > rules.max) {
    errors.push(`Value must be no more than ${rules.max}`);
  }

  // Integer validation
  if (rules.type === 'number' && !Number.isInteger(sanitizedValue)) {
    warnings.push('Value is not an integer');
  }

  // Enum validation
  if (rules.enum && !rules.enum.includes(sanitizedValue)) {
    errors.push(`Value must be one of: ${rules.enum.join(', ')}`);
  }

  // Custom validation
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

export const validateBoolean = (
  value: DynamicValue,
  rules: Partial<ValidationRule> = {}
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;

  // Type check and conversion
  if (typeof value !== 'boolean') {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push('Value is required');
      }
    } else if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
        sanitizedValue = true;
        warnings.push('String value was converted to boolean');
      } else if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
        sanitizedValue = false;
        warnings.push('String value was converted to boolean');
      } else {
        errors.push('Value must be a boolean or recognized string');
      }
    } else if (typeof value === 'number') {
      sanitizedValue = value !== 0;
      warnings.push('Number value was converted to boolean');
    } else {
      errors.push('Value must be a boolean');
    }
  }

  if (typeof sanitizedValue !== 'boolean') {
    return { isValid: false, errors, warnings };
  }

  // Custom validation
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