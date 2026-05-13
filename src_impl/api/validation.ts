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
// ============================================================================
// Validation Helpers
// ============================================================================
// ============================================================================
// Common API Response Schemas
// ============================================================================
// ============================================================================
// Middleware for API Client
// ============================================================================
// ============================================================================
// Schema Versioning for Migrations
// ============================================================================

interface SchemaVersion<T> {
  version: number;
  schema: ZodType<T>;
  migrate?: (data: unknown) => unknown;
}

// ============================================================================
// Validation Logging
// ============================================================================
// ============================================================================
// Export Common Schemas
// ============================================================================

export { z };
export type { ZodType, ZodError };
export * from "./validation.types";
export * from "./validation.types";
export * from "./validation.part1";
