import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Validation Utilities
 * Comprehensive validation helpers with rich error messages
 *
 * Features:
 * - Type guards
 * - Range validation
 * - Schema validation
 * - Sanitization helpers
 * - Custom error messages
 */

import { z } from 'zod';

// ============================================================================
// Type Guards
// ============================================================================
// ============================================================================
// Range Validation
// ============================================================================
// ============================================================================
// Schema Validation Helpers
// ============================================================================
// ============================================================================
// String Sanitization
// ============================================================================
// ============================================================================
// Number Formatting & Validation
// ============================================================================
// ============================================================================
// Array Validation
// ============================================================================
// ============================================================================
// Date Validation
// ============================================================================
// ============================================================================
// URL Validation
// ============================================================================
// ============================================================================
// Password Validation
// ============================================================================
// ============================================================================
// Export All
// ============================================================================

export default {
  isNonEmptyString,
  isPositiveInteger,
  isNonNegativeNumber,
  isValidEmail,
  isValidUUID,
  isPlainObject,
  validateRange,
  clamp,
  clamp01,
  validateSchema,
  createValidator,
  sanitizeString,
  truncateString,
  formatNumber,
  parseNumber,
  validateArray,
  isValidDate,
  validateDateRange,
  isValidURL,
  isValidImageURL,
  validatePassword,
};

export * from "./validation.types";
export * from "./validation.part1";
export * from "./validation.part2";
export * from "./validation.part3";
