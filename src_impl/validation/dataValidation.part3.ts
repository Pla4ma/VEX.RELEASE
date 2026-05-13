

export const validateObject = (
  value: DynamicValue,
  schema: ValidationSchema,
  options: { strict?: boolean; allowUnknown?: boolean } = {}
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedObject: DynamicValue = {};

  // Type check
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    errors.push('Value must be an object');
    return { isValid: false, errors, warnings };
  }

  // Validate each field
  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldValue = value[fieldName];
    let fieldResult: DataValidationResult;

    switch (rules.type) {
      case 'string':
        fieldResult = validateString(fieldValue, rules);
        break;
      case 'number':
        fieldResult = validateNumber(fieldValue, rules);
        break;
      case 'boolean':
        fieldResult = validateBoolean(fieldValue, rules);
        break;
      case 'date':
        fieldResult = validateDate(fieldValue, rules);
        break;
      case 'array':
        fieldResult = validateArray(fieldValue, rules);
        break;
      case 'object':
        fieldResult = validateObject(fieldValue, rules.schema || {}, options);
        break;
      default:
        fieldResult = { isValid: true, errors: [], warnings: [] };
    }

    if (!fieldResult.isValid) {
      errors.push(...fieldResult.errors.map(err => `${fieldName}: ${err}`));
    }

    warnings.push(...fieldResult.warnings.map(warn => `${fieldName}: ${warn}`));

    if (fieldResult.sanitizedData !== undefined) {
      sanitizedObject[fieldName] = fieldResult.sanitizedData;
    } else if (fieldValue !== undefined) {
      sanitizedObject[fieldName] = fieldValue;
    }
  }

  // Check for missing required fields
  for (const [fieldName, rules] of Object.entries(schema)) {
    if (rules.required && !(fieldName in value)) {
      errors.push(`${fieldName} is required`);
    }
  }

  // Check for unknown fields
  if (options.strict || !options.allowUnknown) {
    for (const fieldName of Object.keys(value)) {
      if (!schema[fieldName]) {
        if (options.strict) {
          errors.push(`Unknown field: ${fieldName}`);
        } else {
          warnings.push(`Unknown field: ${fieldName}`);
          sanitizedObject[fieldName] = value[fieldName];
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedObject,
  };
};

export const validateEmail = (email: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedEmail = email;

  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string');
    return { isValid: false, errors, warnings };
  }

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  // Length validation
  if (email.length > 254) {
    errors.push('Email is too long (maximum 254 characters)');
    sanitizedEmail = email.substring(0, 254);
    warnings.push('Email was truncated');
  }

  // Local part validation
  const [localPart, domain] = email.split('@');
  if (localPart && localPart.length > 64) {
    errors.push('Email local part is too long');
  }

  // Domain validation
  if (domain && domain.length > 253) {
    errors.push('Email domain is too long');
  }

  // Suspicious domains
  const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  if (domain && suspiciousDomains.some(suspicious => domain.includes(suspicious))) {
    warnings.push('Using temporary email service');
  }

  // Sanitization
  sanitizedEmail = sanitizedEmail.toLowerCase().trim();

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedEmail,
  };
};

export const validateURL = (url: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedURL = url;

  if (!url || typeof url !== 'string') {
    errors.push('URL is required and must be a string');
    return { isValid: false, errors, warnings };
  }

  try {
    const parsedURL = new URL(url);

    // Protocol validation
    const allowedProtocols = ['http:', 'https:', 'ftp:', 'ftps:'];
    if (!allowedProtocols.includes(parsedURL.protocol)) {
      errors.push('Protocol not allowed');
    }

    // HTTPS recommendation
    if (parsedURL.protocol !== 'https:') {
      warnings.push('Consider using HTTPS for better security');
    }

    // Length validation
    if (url.length > 2048) {
      errors.push('URL is too long (maximum 2048 characters)');
      sanitizedURL = url.substring(0, 2048);
      warnings.push('URL was truncated');
    }

  } catch (error) {
    errors.push('Invalid URL format');
  }

  // Sanitization
  sanitizedURL = sanitizedURL.trim();

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedURL,
  };
};