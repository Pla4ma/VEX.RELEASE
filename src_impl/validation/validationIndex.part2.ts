

export const VALIDATION_CONSTANTS = {
  MAX_STRING_LENGTH: 1000,
  MAX_ARRAY_LENGTH: 1000,
  MAX_OBJECT_DEPTH: 10,
  MAX_FILE_SIZE: 10485760, // 10MB
  MAX_EMAIL_LENGTH: 254,
  MAX_URL_LENGTH: 2048,
  MAX_PHONE_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  DEFAULT_RATE_LIMIT: 100,
  DEFAULT_TIMEOUT: 30000,
} as const;

export const VALIDATION_ERROR_CODES = {
  REQUIRED: 'REQUIRED',
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_FORMAT: 'INVALID_FORMAT',
  TOO_SHORT: 'TOO_SHORT',
  TOO_LONG: 'TOO_LONG',
  INVALID_RANGE: 'INVALID_RANGE',
  PATTERN_MISMATCH: 'PATTERN_MISMATCH',
  SECURITY_THREAT: 'SECURITY_THREAT',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  PERFORMANCE_ISSUE: 'PERFORMANCE_ISSUE',
} as const;

export const ValidationUtils = {
  /**
   * Check if value is empty
   */
  isEmpty(value: DynamicValue): boolean {
    return value === null || value === undefined || value === '' ||
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  },

  /**
   * Sanitize string
   */
  sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  },

  /**
   * Check if string contains only allowed characters
   */
  hasOnlyAllowedChars(str: string, allowed: RegExp): boolean {
    return allowed.test(str);
  },

  /**
   * Format validation result
   */
  formatResult(isValid: boolean, errors: string[] = [], warnings: string[] = []): DynamicValue {
    return {
      isValid,
      errors,
      warnings,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Merge validation results
   */
  mergeResults(...results: DynamicValue[]): DynamicValue {
    const merged = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
    };

    for (const result of results) {
      if (!result.isValid) {
        merged.isValid = false;
      }

      if (result.errors) {
        merged.errors.push(...result.errors);
      }

      if (result.warnings) {
        merged.warnings.push(...result.warnings);
      }
    }

    return merged;
  },

  /**
   * Create error message with context
   */
  createError(message: string, context?: string, code?: string): string {
    const parts = [message];

    if (context) {
      parts.push(`(${context})`);
    }

    if (code) {
      parts.push(`[${code}]`);
    }

    return parts.join(' ');
  },

  /**
   * Validate async function
   */
  async validateAsync<T>(
    validator: (data: T) => Promise<boolean>,
    data: T,
    timeout: number = 5000
  ): Promise<boolean> {
    return Promise.race([
      validator(data),
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Validation timeout')), timeout)
      ),
    ]);
  },
};