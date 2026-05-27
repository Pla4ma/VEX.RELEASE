export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  threats: string[];
  sanitizedData?: unknown;
  securityLevel: "low" | "medium" | "high";
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
