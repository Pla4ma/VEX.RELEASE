/**
 * Authentication Validation Layer
 * 
 * Comprehensive validation for authentication-related operations including login,
  * session management, token validation, and security checks.
 */

export interface AuthValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  securityLevel: 'low' | 'medium' | 'high';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface TokenData {
  token: string;
  type: 'access' | 'refresh' | 'reset' | 'verification';
  userId?: string;
  expiresAt?: Date;
  scopes?: string[];
}

export interface PasswordResetData {
  email: string;
  token?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorData {
  code: string;
  backupCode?: string;
  method: 'totp' | 'sms' | 'email' | 'backup';
}

// Login credentials validation
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

// Session validation
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

// Token validation
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

// Password reset validation
export const validatePasswordReset = (data: PasswordResetData): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  // Email validation
  if (!data.email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }
  }

  // Token validation (if provided)
  if (data.token) {
    if (typeof data.token !== 'string' || data.token.length < 10) {
      errors.push('Invalid reset token format');
    }
  }

  // New password validation
  if (!data.newPassword) {
    errors.push('New password is required');
  } else {
    if (data.newPassword.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (data.newPassword.length > 128) {
      errors.push('Password is too long');
    }

    if (!/[A-Z]/.test(data.newPassword)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(data.newPassword)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(data.newPassword)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.newPassword)) {
      errors.push('Password must contain at least one special character');
    }

    // Security level assessment
    if (data.newPassword.length >= 12 && /[A-Z]/.test(data.newPassword) && /[a-z]/.test(data.newPassword) && /\d/.test(data.newPassword) && /[!@#$%^&*]/.test(data.newPassword)) {
      securityLevel = 'high';
    } else if (data.newPassword.length < 8 || !/[!@#$%^&*]/.test(data.newPassword)) {
      securityLevel = 'low';
      warnings.push('Consider using a stronger password');
    }
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.push('Password confirmation is required');
  } else if (data.newPassword !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

// Two-factor authentication validation
export const validateTwoFactor = (data: TwoFactorData): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'high';

  // Code validation
  if (!data.code) {
    errors.push('Two-factor code is required');
  } else {
    if (data.method === 'totp' || data.method === 'sms' || data.method === 'email') {
      if (!/^\d{6}$/.test(data.code)) {
        errors.push('Two-factor code must be 6 digits');
      }
    } else if (data.method === 'backup') {
      if (!/^[a-zA-Z0-9]{8,12}$/.test(data.code)) {
        errors.push('Backup code must be 8-12 alphanumeric characters');
      }
    }
  }

  // Method validation
  if (!data.method) {
    errors.push('Two-factor method is required');
  } else {
    const validMethods = ['totp', 'sms', 'email', 'backup'];
    if (!validMethods.includes(data.method)) {
      errors.push('Invalid two-factor method');
    }

    if (data.method === 'backup') {
      securityLevel = 'medium';
      warnings.push('Using backup code - consider setting up 2FA again');
    }
  }

  // Backup code validation (if provided)
  if (data.backupCode) {
    if (!/^[a-zA-Z0-9]{8,12}$/.test(data.backupCode)) {
      errors.push('Invalid backup code format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

// Rate limiting validation
export const validateRateLimit = (attempts: number, windowMs: number, maxAttempts: number): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (attempts < 0) {
    errors.push('Invalid attempt count');
  }

  if (windowMs <= 0) {
    errors.push('Invalid time window');
  }

  if (maxAttempts <= 0) {
    errors.push('Invalid maximum attempts');
  }

  if (attempts >= maxAttempts) {
    errors.push('Rate limit exceeded');
    securityLevel = 'high';
  } else if (attempts >= maxAttempts * 0.8) {
    warnings.push('Approaching rate limit');
    securityLevel = 'medium';
  }

  // Check for suspicious patterns
  if (attempts > 10 && windowMs < 60000) { // 10 attempts in less than 1 minute
    securityLevel = 'low';
    warnings.push('High frequency of attempts detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel,
  };
};

// Security headers validation
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

// IP address validation for security
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

  // Check for suspicious IP ranges
  const suspiciousRanges = [
    '0.0.0.0/8',     // This network
    '169.254.0.0/16', // Link-local
    '224.0.0.0/4',    // Multicast
    '240.0.0.0/4',    // Reserved
  ];

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

// Helper function to check if IP is in range (simplified)
function isIPInRange(ip: string, range: string): boolean {
  // This is a simplified implementation
  // In production, use a proper IP range library
  const [network, prefixLength] = range.split('/');
  return ip.startsWith(network.split('.')[0]);
}
