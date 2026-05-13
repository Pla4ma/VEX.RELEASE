

export const validateSecurityHeaders = (headers: Record<string, string>): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  // Content Security Policy
  if (!headers['content-security-policy']) {
    warnings.push('Missing Content Security Policy header');
    securityLevel = 'low';
  }

  // X-Frame-Options
  if (!headers['x-frame-options']) {
    warnings.push('Missing X-Frame-Options header');
    securityLevel = 'low';
  } else if (!['DENY', 'SAMEORIGIN', 'ALLOW-FROM'].includes(headers['x-frame-options'])) {
    warnings.push('Unusual X-Frame-Options value');
  }

  // X-Content-Type-Options
  if (!headers['x-content-type-options']) {
    warnings.push('Missing X-Content-Type-Options header');
    securityLevel = 'low';
  } else if (headers['x-content-type-options'] !== 'nosniff') {
    warnings.push('Unusual X-Content-Type-Options value');
  }

  // Strict-Transport-Security
  if (!headers['strict-transport-security']) {
    warnings.push('Missing Strict-Transport-Security header');
    securityLevel = 'low';
  }

  // Authorization header
  if (headers.authorization) {
    const authParts = headers.authorization.split(' ');
    if (authParts.length !== 2) {
      errors.push('Invalid Authorization header format');
    } else {
      const [scheme, credentials] = authParts;
      if (scheme !== 'Bearer' && scheme !== 'Basic') {
        warnings.push('Unusual authentication scheme');
      }

      if (scheme === 'Bearer' && credentials.length < 20) {
        errors.push('Bearer token appears too short');
      }

      if (scheme === 'Basic') {
        try {
          const decoded = atob(credentials);
          const [username, password] = decoded.split(':');
          if (!username || !password) {
            errors.push('Invalid Basic authentication credentials');
          }
        } catch {
          errors.push('Invalid Basic authentication encoding');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

export const validateIPAddress = (ip: string, context: 'login' | 'api' | 'admin'): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!ip) {
    errors.push('IP address is required');
    return { isValid: false, errors, warnings, securityLevel };
  }

  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 validation (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    errors.push('Invalid IP address format');
  }

  // Check if IP is in private range (for public services)
  const privateRanges = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
  ];

  if (context === 'api' || context === 'admin') {
    // For API and admin, private IPs might be suspicious
    if (privateRanges.some(range => isIPInRange(ip, range))) {
      warnings.push('Private IP address for public service');
      securityLevel = 'low';
    }
  }

  // Check for known malicious IPs (simplified)
  const knownMalicious = [
    '192.0.2.0/24',    // TEST-NET-1
    '198.51.100.0/24', // TEST-NET-2
    '203.0.113.0/24',  // TEST-NET-3
  ];

  if (knownMalicious.some(range => isIPInRange(ip, range))) {
    errors.push('Known malicious IP address');
    securityLevel = 'low';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};