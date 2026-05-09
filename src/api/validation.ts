import { captureSilentFailure } from '../utils/silent-failure';
/**
 * API Response Validation
 *
 * Runtime validation middleware for API responses using Zod
 * Ensures type safety at runtime boundaries
 */

import { z, type ZodType, type ZodError } from 'zod';
import { getAnalyticsService } from '../analytics/AnalyticsService';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('api:validation');

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  error: string;
  details: z.ZodIssue[];
  rawData: unknown;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate data against a Zod schema
 */
export function validateSchema<T>(schema: ZodType<T>, data: unknown): ValidationResult<T> {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      debug.error('Validation failed', new Error(JSON.stringify(error.errors)));

      // Track validation errors
      const analytics = getAnalyticsService();
      analytics.track('api_validation_error', {
        errors: error.errors.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`),
        schema: schema.description || 'unknown',
      });

      return {
        success: false,
        error: 'Response validation failed',
        details: error.errors,
        rawData: data,
      };
    }
    throw error;
  }
}

/**
 * Async validation with logging
 */
export async function validateAsync<T>(
  schema: ZodType<T>,
  data: Promise<unknown>
): Promise<ValidationResult<T>> {
  const resolved = await data;
  return validateSchema(schema, resolved);
}

/**
 * Safe parse that returns null on failure (for optional data)
 */
export function safeParseOptional<T>(schema: ZodType<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

// ============================================================================
// Common API Response Schemas
// ============================================================================

/**
 * Pagination response schema factory
 */
export function createPaginatedResponseSchema<T>(itemSchema: ZodType<T>) {
  return z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      totalPages: z.number().int().nonnegative(),
      totalItems: z.number().int().nonnegative(),
    }),
  });
}

/**
 * Standard API error response schema
 */
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  status: z.number().int(),
  details: z.unknown().optional(),
});

/**
 * Standard API success response wrapper
 */
export function createApiResponseSchema<T>(dataSchema: ZodType<T>) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  });
}

// ============================================================================
// Middleware for API Client
// ============================================================================

/**
 * Create validation interceptor for API client
 */
export function createValidationInterceptor<T>(schema: ZodType<T>) {
  return async (response: Response): Promise<Response> => {
    // Clone response to allow multiple reads
    const cloned = response.clone();

    try {
      const data = await cloned.json();
      const result = validateSchema(schema, data);

      if (!result.success) {
        debug.error('API response validation failed', new Error(result.error));
        // Don't throw - let the client handle it
        // But attach validation info for debugging
        (response as Response & { __validationError?: ValidationError }).__validationError = result;
      }
    } catch (error) { captureSilentFailure(error, { feature: 'api', operation: 'safe-fallback', type: 'data' });
      // Not JSON or other error, ignore
    }

    return response;
  };
}

// ============================================================================
// Schema Versioning for Migrations
// ============================================================================

interface SchemaVersion<T> {
  version: number;
  schema: ZodType<T>;
  migrate?: (data: unknown) => unknown;
}

/**
 * Create versioned schema with migration support
 */
export function createVersionedSchema<T>(
  versions: SchemaVersion<T>[],
  currentVersion: number
) {
  return {
    current: versions.find(v => v.version === currentVersion)?.schema,
    parse: (data: unknown): ValidationResult<T> => {
      const version = (data as { __version?: number })?.__version || 1;
      const versionConfig = versions.find(v => v.version === version);

      if (!versionConfig) {
        return {
          success: false,
          error: `Unknown schema version: ${version}`,
          details: [],
          rawData: data,
        };
      }

      // Migrate if needed
      let migratedData = data;
      if (versionConfig.migrate && version < currentVersion) {
        migratedData = versionConfig.migrate(data);
      }

      return validateSchema(versionConfig.schema, migratedData);
    },
  };
}

// ============================================================================
// Validation Logging
// ============================================================================

/**
 * Log validation metrics for monitoring
 */
export function logValidationMetrics(
  endpoint: string,
  result: ValidationResult<unknown>,
  duration: number
): void {
  const analytics = getAnalyticsService();

  analytics.track('api_validation', {
    endpoint,
    success: result.success,
    duration,
    errorCount: result.success ? 0 : result.details.length,
  });
}

// ============================================================================
// Export Common Schemas
// ============================================================================

export { z };
export type { ZodType, ZodError };