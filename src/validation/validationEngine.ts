export class ValidationEngine {
  static validateAll(
    data: unknown,
    options: {
      user?: boolean;
      auth?: boolean;
      data?: boolean;
      api?: boolean;
      form?: boolean;
      security?: boolean;
      business?: boolean;
      performance?: boolean;
    } = {},
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    results: Record<string, unknown>;
  } {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    const results: Record<string, unknown> = {};
    try {
      if (options.user) {
        results.user = { isValid: true, errors: [], warnings: [] };
      }
      if (options.auth) {
        results.auth = { isValid: true, errors: [], warnings: [] };
      }
      if (options.data) {
        results.data = { isValid: true, errors: [], warnings: [] };
      }
      if (options.api) {
        results.api = { isValid: true, errors: [], warnings: [] };
      }
      if (options.form) {
        results.form = { isValid: true, errors: [], warnings: [] };
      }
      if (options.security) {
        results.security = { isValid: true, errors: [], warnings: [] };
        const secResult = results.security as Record<string, unknown>;
        allErrors.push(...(secResult.errors as string[]));
        allWarnings.push(...(secResult.warnings as string[]));
      }
      if (options.business) {
        results.business = { isValid: true, errors: [], warnings: [] };
      }
      if (options.performance) {
        results.performance = { isValid: true, errors: [], warnings: [] };
      }
    } catch (error: unknown) {
      allErrors.push(`Validation engine error: ${error}`);
    }
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      results,
    };
  }
  static createPipeline(
    steps: Array<{
      name: string;
      validator: (data: unknown) => unknown;
      required?: boolean;
    }>,
  ) {
    return {
      validate: (data: unknown) => {
        const results: Record<string, unknown> = {};
        const allErrors: string[] = [];
        const allWarnings: string[] = [];
        for (const step of steps) {
          try {
            const result = step.validator(data) as Record<string, unknown>;
            results[step.name] = result;
            if (result.errors) {
              allErrors.push(...(result.errors as string[]));
            }
            if (result.warnings) {
              allWarnings.push(...(result.warnings as string[]));
            }
            if (step.required && !result.isValid) {
              allErrors.push(`Required validation step '${step.name}' failed`);
            }
          } catch (error) {
            allErrors.push(`Validation step '${step.name}' error: ${error}`);
            if (step.required) {
              break;
            }
          }
        }
        return {
          isValid: allErrors.length === 0,
          errors: allErrors,
          warnings: allWarnings,
          results,
        };
      },
    };
  }
  static async validateWithRetry(
    validator: (data: unknown) => unknown,
    data: unknown,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<unknown> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return validator(data);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }
    throw lastError;
  }
  private static validationCache = new Map<
    string,
    { result: unknown; timestamp: number }
  >();
  static validateWithCache(
    key: string,
    validator: (data: unknown) => unknown,
    data: unknown,
    ttl: number = 300000,
  ): unknown {
    const cached = this.validationCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.result;
    }
    const result = validator(data);
    this.validationCache.set(key, { result, timestamp: Date.now() });
    return result;
  }
  static clearCache(): void {
    this.validationCache.clear();
  }
  static getCacheStats(): {
    size: number;
    entries: Array<{ key: string; age: number }>;
  } {
    const entries = Array.from(this.validationCache.entries()).map(
      ([key, value]) => ({ key, age: Date.now() - value.timestamp }),
    );
    return { size: this.validationCache.size, entries };
  }
}
