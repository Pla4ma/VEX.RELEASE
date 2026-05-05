/**
 * Data Validation Layer
 *
 * Comprehensive validation for various data types including strings, numbers,
 * dates, arrays, objects, and complex data structures with type safety.
 */

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
}

export interface ValidationRule {
  name: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => string | null;
  schema?: ValidationSchema;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// String validation
export const validateString = (
  value: any,
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

// Number validation
export const validateNumber = (
  value: any,
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

// Boolean validation
export const validateBoolean = (
  value: any,
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

// Date validation
export const validateDate = (
  value: any,
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

// Array validation
export const validateArray = (
  value: any,
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
    sanitizedValue = sanitizedValue.map((item: any, index: number) => {
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

// Object validation
export const validateObject = (
  value: any,
  schema: ValidationSchema,
  options: { strict?: boolean; allowUnknown?: boolean } = {}
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedObject: any = {};

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

// Email validation
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

// URL validation
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

// UUID validation
export const validateUUID = (uuid: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedUUID = uuid;

  if (!uuid || typeof uuid !== 'string') {
    errors.push('UUID is required and must be a string');
    return { isValid: false, errors, warnings };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    errors.push('Invalid UUID format');
  }

  // Sanitization
  sanitizedUUID = sanitizedUUID.toLowerCase();

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedUUID,
  };
};

// JSON validation
export const validateJSON = (json: string, schema?: any): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedData: any = null;

  if (!json || typeof json !== 'string') {
    errors.push('JSON is required and must be a string');
    return { isValid: false, errors, warnings };
  }

  try {
    sanitizedData = JSON.parse(json);

    // Schema validation (basic)
    if (schema) {
      if (typeof schema === 'object' && schema.type) {
        if (schema.type === 'object' && typeof sanitizedData !== 'object') {
          errors.push('JSON must be an object');
        } else if (schema.type === 'array' && !Array.isArray(sanitizedData)) {
          errors.push('JSON must be an array');
        }
      }
    }

    // Size validation
    if (json.length > 1048576) { // 1MB
      warnings.push('JSON is large (>1MB)');
    }

  } catch (error) {
    errors.push('Invalid JSON format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData,
  };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedPhone = phone;

  if (!phone || typeof phone !== 'string') {
    errors.push('Phone number is required and must be a string');
    return { isValid: false, errors, warnings };
  }

  // Remove non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    errors.push('Phone number must have at least 10 digits');
  }

  if (digitsOnly.length > 15) {
    errors.push('Phone number has too many digits (maximum 15)');
  }

  // Format validation
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    errors.push('Phone number contains invalid characters');
  }

  // International format check
  if (!phone.startsWith('+') && digitsOnly.length === 11) {
    warnings.push('Consider using international format with country code');
  }

  // Sanitization
  sanitizedPhone = phone.trim();

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedPhone,
  };
};

// Credit card validation
export const validateCreditCard = (cardNumber: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedCard = cardNumber;

  if (!cardNumber || typeof cardNumber !== 'string') {
    errors.push('Card number is required and must be a string');
    return { isValid: false, errors, warnings };
  }

  // Remove spaces and dashes
  const cleanCard = cardNumber.replace(/[\s-]/g, '');

  // Length validation
  if (cleanCard.length < 13 || cleanCard.length > 19) {
    errors.push('Card number must be between 13 and 19 digits');
  }

  // Digit validation
  if (!/^\d+$/.test(cleanCard)) {
    errors.push('Card number must contain only digits');
  }

  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;

  for (let i = cleanCard.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanCard[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    errors.push('Invalid card number (failed Luhn check)');
  }

  // Card type detection
  let cardType = 'unknown';
  if (/^4/.test(cleanCard)) {
    cardType = 'visa';
  } else if (/^5[1-5]/.test(cleanCard)) {
    cardType = 'mastercard';
  } else if (/^3[47]/.test(cleanCard)) {
    cardType = 'amex';
  } else if (/^6(?:011|5)/.test(cleanCard)) {
    cardType = 'discover';
  }

  if (cardType !== 'unknown') {
    warnings.push(`Detected card type: ${cardType}`);
  }

  // Sanitization
  sanitizedCard = sanitizedCard.trim();

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedCard,
  };
};
