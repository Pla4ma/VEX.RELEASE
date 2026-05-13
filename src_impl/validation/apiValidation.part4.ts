

export const validateRateLimit = (
  currentRequests: number,
  windowMs: number,
  maxRequests: number,
  identifier: string
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (currentRequests >= maxRequests) {
    errors.push(`Rate limit exceeded for ${identifier}: ${currentRequests}/${maxRequests}`);
    securityLevel = 'low';
  } else if (currentRequests >= maxRequests * 0.8) {
    warnings.push(`Approaching rate limit for ${identifier}: ${currentRequests}/${maxRequests}`);
    securityLevel = 'medium';
  }

  // Suspicious activity detection
  if (currentRequests > maxRequests * 2) {
    errors.push(`Suspicious activity detected for ${identifier}: ${currentRequests} requests`);
    securityLevel = 'low';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};