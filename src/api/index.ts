/**
 * API Layer Export
 *
 * Complete API layer with:
 * - HTTP client with circuit breaker, retry, deduplication
 * - React Query integration
 * - Runtime validation with Zod
 */

export { QueryProvider, queryClient, QueryKeys } from './QueryProvider';
export { ApiClient, getApiClient, resetApiClient } from './api-client';
export {
  validateSchema,
  validateAsync,
  safeParseOptional,
  createPaginatedResponseSchema,
  createApiResponseSchema,
  createValidationInterceptor,
  createVersionedSchema,
  logValidationMetrics,
  ApiErrorSchema,
  z,
  type ValidationResult,
  type ValidationSuccess,
  type ValidationError,
  type ZodType,
  type ZodError,
} from './validation';
