

export const validateCSRF = (token: string, sessionToken: string): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!token) {
    errors.push('CSRF token is missing');
    threats.push('Missing CSRF protection');
    securityLevel = 'low';
  }

  if (!sessionToken) {
    errors.push('Session token is missing');
    threats.push('Missing session validation');
    securityLevel = 'low';
  }

  if (token && sessionToken) {
    // Token length validation
    if (token.length < 20) {
      errors.push('CSRF token is too short');
      threats.push('Weak CSRF token');
      securityLevel = 'low';
    }

    if (sessionToken.length < 20) {
      errors.push('Session token is too short');
      threats.push('Weak session token');
      securityLevel = 'low';
    }

    // Token format validation
    const tokenRegex = /^[a-zA-Z0-9_-]+$/;
    if (!tokenRegex.test(token)) {
      errors.push('Invalid CSRF token format');
      threats.push('Malformed CSRF token');
      securityLevel = 'low';
    }

    if (!tokenRegex.test(sessionToken)) {
      errors.push('Invalid session token format');
      threats.push('Malformed session token');
      securityLevel = 'low';
    }

    // Token entropy check (simplified)
    const uniqueChars = new Set(token).size;
    if (uniqueChars < token.length * 0.3) {
      warnings.push('CSRF token may have low entropy');
      securityLevel = 'medium';
    }

    const sessionUniqueChars = new Set(sessionToken).size;
    if (sessionUniqueChars < sessionToken.length * 0.3) {
      warnings.push('Session token may have low entropy');
      securityLevel = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    threats,
    securityLevel,
  };
};

export const sanitizeInput = (input: string, config: SecurityConfig): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';
  let sanitizedInput = input;

  if (!input || typeof input !== 'string') {
    return { isValid: true, errors, warnings, threats, securityLevel };
  }

  // Length validation
  if (input.length > config.maxInputLength) {
    errors.push(`Input exceeds maximum length (${config.maxInputLength})`);
    sanitizedInput = input.substring(0, config.maxInputLength);
    warnings.push('Input was truncated to maximum length');
  }

  // HTML tag removal
  if (config.enableInputSanitization) {
    const tagPattern = /<[^>]*>/g;
    const tagMatches = input.match(tagPattern);

    if (tagMatches) {
      warnings.push(`HTML tags detected and removed: ${tagMatches.length} tags`);
      sanitizedInput = sanitizedInput.replace(tagPattern, '');
    }

    // Specific allowed tags
    if (config.allowedTags && config.allowedTags.length > 0) {
      const allowedTagPattern = new RegExp(`<(?!\\/?(${config.allowedTags.join('|')})\\b)[^>]*>`, 'gi');
      const disallowedMatches = sanitizedInput.match(allowedTagPattern);

      if (disallowedMatches) {
        warnings.push(`Disallowed HTML tags removed: ${disallowedMatches.length} tags`);
        sanitizedInput = sanitizedInput.replace(allowedTagPattern, '');
      }
    }
  }

  // Attribute validation
  if (config.allowedAttributes && config.allowedAttributes.length > 0) {
    const attributePattern = /\b(\w+)=/g;
    const attributes = [];
    let match;

    while ((match = attributePattern.exec(sanitizedInput)) !== null) {
      attributes.push(match[1]);
    }

    const disallowedAttributes = attributes.filter(attr => !config.allowedAttributes!.includes(attr));

    if (disallowedAttributes.length > 0) {
      warnings.push(`Disallowed attributes detected: ${disallowedAttributes.join(', ')}`);

      // Remove disallowed attributes
      for (const attr of disallowedAttributes) {
        const attrPattern = new RegExp(`\\b${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
        sanitizedInput = sanitizedInput.replace(attrPattern, '');
      }
    }
  }

  // Blocked patterns
  if (config.blockedPatterns && config.blockedPatterns.length > 0) {
    for (const pattern of config.blockedPatterns) {
      const matches = sanitizedInput.match(pattern);
      if (matches) {
        warnings.push(`Blocked pattern detected and removed: ${pattern.source}`);
        sanitizedInput = sanitizedInput.replace(pattern, '');
        threats.push('Blocked content detected');
        securityLevel = 'low';
      }
    }
  }

  // Whitespace normalization
  sanitizedInput = sanitizedInput.replace(/\s+/g, ' ').trim();

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    threats,
    securityLevel,
    sanitizedData: sanitizedInput,
  };
};