

export const validateLoginCredentials = (credentials: LoginCredentials): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  // Email validation
  if (!credentials.email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      errors.push('Invalid email format');
    }
  }

  // Password validation
  if (!credentials.password) {
    errors.push('Password is required');
  } else {
    if (credentials.password.length < 1) {
      errors.push('Password cannot be empty');
    }

    if (credentials.password.length > 256) {
      errors.push('Password is too long');
    }

    // Security level assessment based on password
    if (credentials.password.length < 8) {
      securityLevel = 'low';
      warnings.push('Consider using a stronger password');
    } else if (credentials.password.length >= 12 && /[A-Z]/.test(credentials.password) && /[a-z]/.test(credentials.password) && /\d/.test(credentials.password) && /[!@#$%^&*]/.test(credentials.password)) {
      securityLevel = 'high';
    }
  }

  // Two-factor validation
  if (credentials.twoFactorCode) {
    if (!/^\d{6}$/.test(credentials.twoFactorCode)) {
      errors.push('Two-factor code must be 6 digits');
    }
  }

  // Remember me validation
  if (credentials.rememberMe && securityLevel === 'low') {
    warnings.push('Using "Remember Me" with weak password is not recommended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

export const validateSession = (session: SessionData): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  // Session ID validation
  if (!session.sessionId) {
    errors.push('Session ID is required');
  } else if (typeof session.sessionId !== 'string' || session.sessionId.length < 10) {
    errors.push('Invalid session ID format');
  }

  // User ID validation
  if (!session.userId) {
    errors.push('User ID is required');
  } else if (typeof session.userId !== 'string' || session.userId.length < 1) {
    errors.push('Invalid user ID format');
  }

  // Token validation
  if (!session.token) {
    errors.push('Access token is required');
  } else if (typeof session.token !== 'string' || session.token.length < 20) {
    errors.push('Invalid token format');
  }

  // Expiration validation
  if (!session.expiresAt) {
    errors.push('Expiration time is required');
  } else if (!(session.expiresAt instanceof Date) || isNaN(session.expiresAt.getTime())) {
    errors.push('Invalid expiration date');
  } else {
    const now = new Date();
    if (session.expiresAt <= now) {
      errors.push('Session has expired');
    } else if (session.expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      warnings.push('Session expires soon');
    }

    // Security level based on session duration
    const sessionDuration = session.expiresAt.getTime() - now.getTime();
    if (sessionDuration > 30 * 24 * 60 * 60 * 1000) { // 30 days
      securityLevel = 'low';
      warnings.push('Long session duration reduces security');
    } else if (sessionDuration < 24 * 60 * 60 * 1000) { // 24 hours
      securityLevel = 'high';
    }
  }

  // IP address validation
  if (session.ipAddress) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(session.ipAddress)) {
      warnings.push('IP address format is unusual');
    }
  }

  // User agent validation
  if (session.userAgent) {
    if (session.userAgent.length > 500) {
      warnings.push('User agent string is unusually long');
    }

    // Check for suspicious user agents
    const suspiciousAgents = ['bot', 'crawler', 'scraper', 'spider'];
    if (suspiciousAgents.some(agent => session.userAgent!.toLowerCase().includes(agent))) {
      securityLevel = 'low';
      warnings.push('Suspicious user agent detected');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

export const validateToken = (token: TokenData): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  // Token validation
  if (!token.token) {
    errors.push('Token is required');
  } else if (typeof token.token !== 'string') {
    errors.push('Token must be a string');
  } else {
    // JWT token format check
    const jwtParts = token.token.split('.');
    if (jwtParts.length !== 3) {
      errors.push('Invalid token format');
    } else {
      try {
        // Check header
        JSON.parse(atob(jwtParts[0]));

        // Check payload
        const payload = JSON.parse(atob(jwtParts[1]));

        if (!payload.exp) {
          warnings.push('Token has no expiration claim');
        } else {
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp <= now) {
            errors.push('Token has expired');
          } else if (payload.exp - now < 300) { // 5 minutes
            warnings.push('Token expires soon');
          }
        }

        if (!payload.iat) {
          warnings.push('Token has no issued at claim');
        }

        if (!payload.sub) {
          warnings.push('Token has no subject claim');
        } else if (typeof payload.sub !== 'string') {
          errors.push('Invalid subject claim in token');
        }

        // Security level based on token expiration
        if (payload.exp && payload.exp - now > 24 * 60 * 60) { // 24 hours
          securityLevel = 'low';
        } else if (payload.exp && payload.exp - now < 60 * 60) { // 1 hour
          securityLevel = 'high';
        }
      } catch {
        errors.push('Token payload is malformed');
      }
    }
  }

  // Token type validation
  if (!token.type) {
    errors.push('Token type is required');
  } else {
    const validTypes = ['access', 'refresh', 'reset', 'verification'];
    if (!validTypes.includes(token.type)) {
      errors.push('Invalid token type');
    }
  }

  // User ID validation
  if (token.userId && (typeof token.userId !== 'string' || token.userId.length < 1)) {
    errors.push('Invalid user ID in token');
  }

  // Expiration validation
  if (token.expiresAt) {
    if (!(token.expiresAt instanceof Date) || isNaN(token.expiresAt.getTime())) {
      errors.push('Invalid expiration date');
    } else if (token.expiresAt <= new Date()) {
      errors.push('Token has expired');
    }
  }

  // Scopes validation
  if (token.scopes) {
    if (!Array.isArray(token.scopes)) {
      errors.push('Scopes must be an array');
    } else {
      for (const scope of token.scopes) {
        if (typeof scope !== 'string' || scope.length < 1) {
          errors.push('Invalid scope format');
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