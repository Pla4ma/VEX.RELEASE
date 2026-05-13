/**
 * Security Validation Layer
 *
 * Comprehensive security validation for input sanitization, XSS prevention,
 * SQL injection detection, CSRF protection, and other security threats.
 */
export interface SecurityValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    threats: string[];
    sanitizedData?: DynamicValue;
    securityLevel: 'low' | 'medium' | 'high';
}

export interface SecurityConfig {
    enableXSSProtection: boolean;
    enableSQLInjectionProtection: boolean;
    enableCSRFProtection: boolean;
    enableInputSanitization: boolean;
    maxInputLength: number;
    allowedTags?: string[];
    allowedAttributes?: string[];
    blockedPatterns?: RegExp[];
}
