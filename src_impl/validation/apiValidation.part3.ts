

export const validatePathParams = (
  params: Record<string, string>,
  requiredParams?: string[]
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!params || typeof params !== 'object') {
    errors.push('Path parameters must be an object');
    return { isValid: false, errors, warnings, securityLevel };
  }

  // Required parameters check
  if (requiredParams && requiredParams.length > 0) {
    for (const requiredParam of requiredParams) {
      if (!params[requiredParam]) {
        errors.push(`Required path parameter missing: ${requiredParam}`);
      }
    }
  }

  // Parameter validation
  for (const [key, value] of Object.entries(params)) {
    // Length validation
    if (key.length > 50) {
      errors.push(`Path parameter name too long: ${key}`);
    }

    if (value.length > 200) {
      errors.push(`Path parameter value too long: ${key}`);
    }

    // Character validation
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(value)) {
      errors.push(`Invalid characters in path parameter: ${key}`);
      securityLevel = 'low';
    }

    // Path traversal check
    if (value.includes('../') || value.includes('..\\')) {
      errors.push(`Path traversal detected in parameter: ${key}`);
      securityLevel = 'low';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

export const validateAPIRequest = (
  request: APIRequest,
  endpoint: APIEndpoint
): APIValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  let overallSecurityLevel: 'low' | 'medium' | 'high' = 'medium';

  // Method validation
  const methodValidation = validateHTTPMethod(request.method);
  allErrors.push(...methodValidation.errors);
  allWarnings.push(...methodValidation.warnings);

  // URL validation
  const urlValidation = validateURL(request.url);
  allErrors.push(...urlValidation.errors);
  allWarnings.push(...urlValidation.warnings);

  // Headers validation
  if (request.headers) {
    const headersValidation = validateHeaders(request.headers, endpoint.allowedHeaders);
    allErrors.push(...headersValidation.errors);
    allWarnings.push(...headersValidation.warnings);
  }

  // Query parameters validation
  if (request.query) {
    const queryValidation = validateQueryParams(request.query);
    allErrors.push(...queryValidation.errors);
    allWarnings.push(...queryValidation.warnings);
  }

  // Path parameters validation
  if (request.params) {
    const pathValidation = validatePathParams(request.params, endpoint.requiredParams);
    allErrors.push(...pathValidation.errors);
    allWarnings.push(...pathValidation.warnings);
  }

  // Body validation
  if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
    const contentType = request.headers?.['content-type'];
    const bodyValidation = validateRequestBody(request.body, contentType, endpoint.maxBodySize);
    allErrors.push(...bodyValidation.errors);
    allWarnings.push(...bodyValidation.warnings);
  } else if (request.body && !['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
    allErrors.push('Request body not allowed for this method');
  }

  // Authentication check
  if (endpoint.authRequired) {
    const authHeader = request.headers?.authorization || request.headers?.Authorization;
    if (!authHeader) {
      allErrors.push('Authentication required for this endpoint');
      overallSecurityLevel = 'low';
    }
  }

  // Rate limiting check
  if (endpoint.rateLimit && endpoint.rateLimit > 0) {
    // This would typically be checked against a rate limiter service
    allWarnings.push(`Rate limit applies: ${endpoint.rateLimit} requests`);
  }

  // Determine overall security level
  if (allErrors.some(error => error.includes('injection') || error.includes('traversal'))) {
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
    securityLevel: overallSecurityLevel,
  };
};

export const validateAPIResponse = (
  response: APIResponse,
  expectedStatus?: number[]
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  // Status code validation
  if (expectedStatus && expectedStatus.length > 0) {
    if (!expectedStatus.includes(response.status)) {
      warnings.push(`Unexpected status code: ${response.status}`);
    }
  }

  // Response size validation
  if (response.body) {
    const responseSize = JSON.stringify(response.body).length;
    if (responseSize > 10485760) { // 10MB
      errors.push('Response body too large (maximum 10MB)');
    }

    // Check for sensitive data exposure
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
    const bodyString = JSON.stringify(response.body).toLowerCase();

    for (const field of sensitiveFields) {
      if (bodyString.includes(field)) {
        warnings.push(`Potential sensitive data exposure: ${field}`);
        securityLevel = 'low';
      }
    }
  }

  // Response time validation
  if (response.duration) {
    if (response.duration > 30000) { // 30 seconds
      warnings.push(`Slow response: ${response.duration}ms`);
    }
  }

  // Security headers check
  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
  ];

  if (response.headers) {
    const missingHeaders = securityHeaders.filter(
      header => !(response.headers![header] || response.headers![header.toLowerCase()])
    );

    if (missingHeaders.length > 0) {
      warnings.push(`Missing security headers in response: ${missingHeaders.join(', ')}`);
      securityLevel = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};