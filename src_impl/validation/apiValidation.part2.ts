

export const validateRequestBody = (
  body: unknown,
  contentType?: string,
  maxSize?: number
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (body === null || body === undefined) {
    return { isValid: true, errors, warnings, securityLevel };
  }

  // Size validation
  const bodySize = JSON.stringify(body).length;
  const maxAllowedSize = maxSize || 1048576; // 1MB default

  if (bodySize > maxAllowedSize) {
    errors.push(`Request body too large (maximum ${maxAllowedSize} bytes)`);
    return { isValid: false, errors, warnings, securityLevel };
  }

  // Content type validation
  if (contentType) {
    const mainType = contentType.split(';')[0].toLowerCase();

    if (mainType.includes('application/json')) {
      if (typeof body !== 'object') {
        errors.push('Body must be an object for JSON content type');
      } else {
        // Check for nested depth
        const maxDepth = 10;
        let currentDepth = 0;

        const checkDepth = (obj: unknown, depth: number): boolean => {
          if (depth > maxDepth) {return false;}
          if (typeof obj !== 'object' || obj === null) {return true;}

          currentDepth = Math.max(currentDepth, depth);
          return Object.values(obj).every(value => checkDepth(value, depth + 1));
        };

        if (!checkDepth(body, 0)) {
          errors.push('Request body nesting too deep (maximum 10 levels)');
        }

        if (currentDepth > 5) {
          warnings.push('Request body has deep nesting');
        }
      }
    }
  }

  // SQL injection check
  const bodyString = JSON.stringify(body).toLowerCase();
  const sqlPatterns = [
    'union select',
    'select from',
    'insert into',
    'update set',
    'delete from',
    'drop table',
    'exec(',
    'script>',
    'javascript:',
    '<script',
  ];

  for (const pattern of sqlPatterns) {
    if (bodyString.includes(pattern)) {
      errors.push(`Potential injection detected: ${pattern}`);
      securityLevel = 'low';
      break;
    }
  }

  // Large array validation
  const checkLargeArrays = (obj: unknown, path: string = ''): void => {
    if (Array.isArray(obj)) {
      if (obj.length > 1000) {
        warnings.push(`Large array detected at ${path}: ${obj.length} items`);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        checkLargeArrays(value, path ? `${path}.${key}` : key);
      }
    }
  };

  checkLargeArrays(body);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

export const validateQueryParams = (
  params: Record<string, string>,
  allowedParams?: string[]
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!params || typeof params !== 'object') {
    errors.push('Query parameters must be an object');
    return { isValid: false, errors, warnings, securityLevel };
  }

  // Allowed parameters check
  if (allowedParams && allowedParams.length > 0) {
    for (const paramName of Object.keys(params)) {
      if (!allowedParams.includes(paramName)) {
        warnings.push(`Parameter not allowed: ${paramName}`);
      }
    }
  }

  // Parameter validation
  for (const [key, value] of Object.entries(params)) {
    // Length validation
    if (key.length > 100) {
      errors.push(`Parameter name too long: ${key}`);
    }

    if (value.length > 1000) {
      errors.push(`Parameter value too long: ${key}`);
    }

    // SQL injection check
    const sqlPatterns = ['union', 'select', 'insert', 'update', 'delete', 'drop'];
    const lowerValue = value.toLowerCase();

    if (sqlPatterns.some(pattern => lowerValue.includes(pattern))) {
      errors.push(`Potential SQL injection in parameter: ${key}`);
      securityLevel = 'low';
    }

    // XSS check
    const xssPatterns = ['<script', 'javascript:', 'onload=', 'onerror='];
    if (xssPatterns.some(pattern => lowerValue.includes(pattern))) {
      errors.push(`Potential XSS in parameter: ${key}`);
      securityLevel = 'low';
    }
  }

  // Number of parameters check
  const paramCount = Object.keys(params).length;
  if (paramCount > 50) {
    warnings.push(`Too many query parameters: ${paramCount}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};