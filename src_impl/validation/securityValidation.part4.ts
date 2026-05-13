

export const validateSecurity = (
  data: DynamicValue,
  config: SecurityConfig,
  _context: 'input' | 'output' | 'file' | 'api' = 'input'
): SecurityValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allThreats: string[] = [];
  let overallSecurityLevel: 'low' | 'medium' | 'high' = 'medium';

  // String validation for XSS and SQL injection
  if (typeof data === 'string') {
    if (config.enableXSSProtection) {
      const xssResult = validateXSS(data, config);
      allErrors.push(...xssResult.errors);
      allWarnings.push(...xssResult.warnings);
      allThreats.push(...xssResult.threats);
    }

    if (config.enableSQLInjectionProtection) {
      const sqlResult = validateSQLInjection(data);
      allErrors.push(...sqlResult.errors);
      allWarnings.push(...sqlResult.warnings);
      allThreats.push(...sqlResult.threats);
    }

    if (config.enableInputSanitization) {
      const sanitizeResult = sanitizeInput(data, config);
      allErrors.push(...sanitizeResult.errors);
      allWarnings.push(...sanitizeResult.warnings);
      allThreats.push(...sanitizeResult.threats);

      if (sanitizeResult.sanitizedData !== undefined) {
        data = sanitizeResult.sanitizedData;
      }
    }
  }

  // Object validation
  if (typeof data === 'object' && data !== null) {
    const validateObject = (obj: DynamicValue, path: string = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string') {
          if (config.enableXSSProtection) {
            const xssResult = validateXSS(value, config);
            if (xssResult.errors.length > 0) {
              allErrors.push(...xssResult.errors.map(err => `${currentPath}: ${err}`));
            }
            if (xssResult.warnings.length > 0) {
              allWarnings.push(...xssResult.warnings.map(warn => `${currentPath}: ${warn}`));
            }
            if (xssResult.threats.length > 0) {
              allThreats.push(...xssResult.threats.map(threat => `${currentPath}: ${threat}`));
            }
          }

          if (config.enableSQLInjectionProtection) {
            const sqlResult = validateSQLInjection(value);
            if (sqlResult.errors.length > 0) {
              allErrors.push(...sqlResult.errors.map(err => `${currentPath}: ${err}`));
            }
            if (sqlResult.warnings.length > 0) {
              allWarnings.push(...sqlResult.warnings.map(warn => `${currentPath}: ${warn}`));
            }
            if (sqlResult.threats.length > 0) {
              allThreats.push(...sqlResult.threats.map(threat => `${currentPath}: ${threat}`));
            }
          }
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          validateObject(value, currentPath);
        }
      }
    };

    validateObject(data);
  }

  // Array validation
  if (Array.isArray(data)) {
    if (data.length > 1000) {
      allWarnings.push('Large array detected');
    }

    data.forEach((item, index) => {
      if (typeof item === 'string') {
        if (config.enableXSSProtection) {
          const xssResult = validateXSS(item, config);
          if (xssResult.errors.length > 0) {
            allErrors.push(...xssResult.errors.map(err => `Array[${index}]: ${err}`));
          }
        }
      }
    });
  }

  // Determine overall security level
  if (allThreats.length > 0) {
    overallSecurityLevel = 'low';
  } else if (allWarnings.length > 5) {
    overallSecurityLevel = 'medium';
  } else {
    overallSecurityLevel = 'high';
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    threats: allThreats,
    securityLevel: overallSecurityLevel,
    sanitizedData: data,
  };
};