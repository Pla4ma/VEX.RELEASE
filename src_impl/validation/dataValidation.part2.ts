

export const validateDate = (
  value: DynamicValue,
  rules: Partial<ValidationRule> = {}
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;

  // Type check and conversion
  if (!(value instanceof Date)) {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push('Value is required');
      }
    } else if (typeof value === 'string') {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        errors.push('Invalid date format');
      } else {
        sanitizedValue = parsed;
        warnings.push('String value was converted to date');
      }
    } else if (typeof value === 'number') {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        errors.push('Invalid timestamp');
      } else {
        sanitizedValue = parsed;
        warnings.push('Number value was converted to date');
      }
    } else {
      errors.push('Value must be a date');
    }
  }

  if (!(sanitizedValue instanceof Date)) {
    return { isValid: false, errors, warnings };
  }

  // Range validation
  const now = new Date();
  if (rules.min !== undefined) {
    const minDate = new Date(rules.min);
    if (sanitizedValue < minDate) {
      errors.push(`Date must be after ${minDate.toISOString()}`);
    }
  }

  if (rules.max !== undefined) {
    const maxDate = new Date(rules.max);
    if (sanitizedValue > maxDate) {
      errors.push(`Date must be before ${maxDate.toISOString()}`);
    }
  }

  // Future/past date warnings
  if (sanitizedValue > now && !rules.max) {
    warnings.push('Date is in the future');
  }

  if (sanitizedValue < now && !rules.min) {
    warnings.push('Date is in the past');
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

export const validateArray = (
  value: DynamicValue,
  rules: Partial<ValidationRule> & { itemRules?: ValidationRule } = {}
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;

  // Type check
  if (!Array.isArray(value)) {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push('Value is required');
      }
    } else {
      errors.push('Value must be an array');
    }
    return { isValid: false, errors, warnings };
  }

  // Length validation
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    errors.push(`Array must have at least ${rules.minLength} items`);
  }

  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    errors.push(`Array must have no more than ${rules.maxLength} items`);
    sanitizedValue = value.slice(0, rules.maxLength);
    warnings.push('Array was truncated to maximum length');
  }

  // Item validation
  if (rules.itemRules) {
    sanitizedValue = sanitizedValue.map((item: DynamicValue, index: number) => {
      let itemResult: DataValidationResult;

      switch (rules.itemRules!.type) {
        case 'string':
          itemResult = validateString(item, rules.itemRules);
          break;
        case 'number':
          itemResult = validateNumber(item, rules.itemRules);
          break;
        case 'boolean':
          itemResult = validateBoolean(item, rules.itemRules);
          break;
        case 'date':
          itemResult = validateDate(item, rules.itemRules);
          break;
        default:
          itemResult = { isValid: true, errors: [], warnings: [] };
      }

      if (!itemResult.isValid) {
        errors.push(`Item ${index}: ${itemResult.errors.join(', ')}`);
      }

      warnings.push(...itemResult.errors.map(err => `Item ${index}: ${err}`));

      return itemResult.sanitizedData !== undefined ? itemResult.sanitizedData : item;
    });
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