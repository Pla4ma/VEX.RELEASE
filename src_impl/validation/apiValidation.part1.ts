

export const validateHTTPMethod = (method: string): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!method || typeof method !== 'string') {
    errors.push('HTTP method is required and must be a string');
    return { isValid: false, errors, warnings, securityLevel };
  }

  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const upperMethod = method.toUpperCase();

  if (!validMethods.includes(upperMethod)) {
    errors.push(`Invalid HTTP method: ${method}`);
    return { isValid: false, errors, warnings, securityLevel };
  }

  // Security assessment based on method
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)) {
    securityLevel = 'high';
  } else if (['GET', 'HEAD'].includes(upperMethod)) {
    securityLevel = 'medium';
  } else {
    securityLevel = 'low';
  }

  return {
    isValid: true,
    errors,
    warnings,
    securityLevel,
  };
};

export const validateURL = (url: string, allowedDomains?: string[]): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!url || typeof url !== 'string') {
    errors.push('URL is required and must be a string');
    return { isValid: false, errors, warnings, securityLevel };
  }

  try {
    const parsedURL = new URL(url);

    // Protocol validation
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsedURL.protocol)) {
      errors.push(`Protocol not allowed: ${parsedURL.protocol}`);
      securityLevel = 'low';
    }

    // HTTPS requirement
    if (parsedURL.protocol !== 'https:') {
      warnings.push('Consider using HTTPS for better security');
      securityLevel = 'low';
    }

    // Domain validation
    if (allowedDomains && allowedDomains.length > 0) {
      if (!allowedDomains.includes(parsedURL.hostname)) {
        errors.push(`Domain not allowed: ${parsedURL.hostname}`);
        securityLevel = 'low';
      }
    }

    // Suspicious domains
    const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
    if (suspiciousDomains.includes(parsedURL.hostname)) {
      warnings.push('Using local development domain');
      securityLevel = 'low';
    }

    // Path validation
    if (parsedURL.pathname.length > 2048) {
      errors.push('URL path is too long (maximum 2048 characters)');
    }

    // Check for path traversal
    if (parsedURL.pathname.includes('../') || parsedURL.pathname.includes('..\\')) {
      errors.push('Path traversal detected in URL');
      securityLevel = 'low';
    }

    // Query parameter validation
    if (parsedURL.search.length > 4096) {
      errors.push('Query string is too long (maximum 4096 characters)');
    }

    // Check for SQL injection patterns in query
    const sqlPatterns = ['union', 'select', 'insert', 'update', 'delete', 'drop'];
    const queryString = parsedURL.search.toLowerCase();
    if (sqlPatterns.some(pattern => queryString.includes(pattern))) {
      errors.push('Potential SQL injection detected in query parameters');
      securityLevel = 'low';
    }

  } catch (error) {
    errors.push('Invalid URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

export const validateHeaders = (
  headers: Record<string, string>,
  allowedHeaders?: string[]
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!headers || typeof headers !== 'object') {
    errors.push('Headers must be an object');
    return { isValid: false, errors, warnings, securityLevel };
  }

  // Allowed headers check
  if (allowedHeaders && allowedHeaders.length > 0) {
    for (const headerName of Object.keys(headers)) {
      if (!allowedHeaders.includes(headerName.toLowerCase())) {
        warnings.push(`Header not allowed: ${headerName}`);
      }
    }
  }

  // Content-Type validation
  const contentType = headers['content-type'] || headers['Content-Type'];
  if (contentType) {
    const validContentTypes = [
      'application/json',
      'application/xml',
      'text/plain',
      'multipart/form-data',
      'application/x-www-form-urlencoded',
    ];

    const mainType = contentType.split(';')[0].toLowerCase();
    if (!validContentTypes.some(type => mainType.includes(type))) {
      warnings.push(`Unusual Content-Type: ${contentType}`);
    }
  }

  // Authorization header validation
  const authHeader = headers.authorization || headers.Authorization;
  if (authHeader) {
    const authParts = authHeader.split(' ');
    if (authParts.length !== 2) {
      errors.push('Invalid Authorization header format');
      securityLevel = 'low';
    } else {
      const [scheme, credentials] = authParts;
      if (scheme !== 'Bearer' && scheme !== 'Basic') {
        warnings.push(`Unusual authentication scheme: ${scheme}`);
      }

      if (scheme === 'Bearer' && credentials.length < 20) {
        warnings.push('Bearer token appears too short');
        securityLevel = 'low';
      }

      if (scheme === 'Basic') {
        try {
          const decoded = atob(credentials);
          const [username, password] = decoded.split(':');
          if (!username || !password) {
            errors.push('Invalid Basic authentication credentials');
            securityLevel = 'low';
          }
        } catch {
          errors.push('Invalid Basic authentication encoding');
          securityLevel = 'low';
        }
      }
    }
  }

  // Security headers validation
  const securityHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'strict-transport-security',
  ];

  const missingSecurityHeaders = securityHeaders.filter(
    header => !(headers[header] || headers[header.toLowerCase()])
  );

  if (missingSecurityHeaders.length > 0) {
    warnings.push(`Missing security headers: ${missingSecurityHeaders.join(', ')}`);
    securityLevel = 'low';
  }

  // Header size validation
  const headerSize = JSON.stringify(headers).length;
  if (headerSize > 8192) { // 8KB
    errors.push('Headers too large (maximum 8KB)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};