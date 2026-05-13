import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Content Study Error Handling & Recovery
 * Comprehensive error management with retry logic, recovery actions, and user feedback
 */

import type { ContentStudyError, ErrorRecoveryAction } from './types';
import { CONTENT_STUDY_CONSTANTS, ContentStudyErrorCode } from './types';
import { buildError, isRecoverableError, shouldRetry, getRetryDelay } from './validation';
import { captureException } from '../../config/sentry';

// ============================================================================
// Error Handler Class
// ============================================================================
// ============================================================================
// Recovery Actions
// ============================================================================
// ============================================================================
// Error Boundary Helper
// ============================================================================
// ============================================================================
// Retry Strategies
// ============================================================================
// ============================================================================
// Export
// ============================================================================
export * from "./errors.types";
export * from "./errors.part1";
export * from "./errors.part2";
export * from "./errors.part3";
