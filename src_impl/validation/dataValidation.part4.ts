

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

export const validateJSON = (json: string, schema?: DynamicValue): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedData: DynamicValue = null;

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