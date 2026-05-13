/**
 * Type-Safe Navigation Helpers
 *
 * Provides strictly-typed navigation functions with no unsafe casts.
 */

import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { createDebugger } from '../utils/debug';
import * as Sentry from '@sentry/react-native';
import type {
  AuthStackParams,
  AuthStackRoute,
  MainStackParams,
  MainStackRoute,
  MainTabParams,
  MainTabRoute,
  RootStackParams,
  RootStackRoute,
  SessionStackParams,
  SessionStackRoute,
  SettingsStackParams,
  SettingsStackRoute,
} from './types';

const debug = createDebugger('navigation:helpers');

// ============================================================================
// Type-Safe Navigation Functions
// ============================================================================
// ============================================================================
// Type-Safe Route Param Getters
// ============================================================================
// ============================================================================
// Safe Navigation Guards
// ============================================================================
// ============================================================================
// Navigation State Helpers
// ============================================================================
// ============================================================================
// Deep Link Safety & Validation (Phase 17 - Bulletproof Navigation)
// ============================================================================

/** Valid route patterns for deep link validation */
const VALID_ROUTE_PATTERNS: Record<string, string[]> = {
  // Main tabs - always safe
  mainTabs: ['Home', 'Focus', 'Progress', 'Profile'],
  // Session routes - require specific params
  sessionRoutes: ['SessionSetup', 'ActiveSession', 'SessionComplete', 'SessionHistory'],
  // Study routes - require content ID
  studyRoutes: ['ContentInput', 'StudyPlan', 'StudyLibrary', 'ContentReview'],
  // Settings - generally safe
  settingsRoutes: ['SettingsMain', 'ProfileEdit', 'Notifications', 'Premium'],
  // Auth routes
  authRoutes: ['Login', 'Signup', 'ForgotPassword'],
};

/**
 * Sanitize params to prevent injection attacks
 */
function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip functions and complex objects
    if (typeof value === 'function' || typeof value === 'symbol') {
      continue;
    }

    // Sanitize strings
    if (typeof value === 'string') {
      // Remove potential XSS attempts, limit length
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove angle brackets
        .slice(0, 1000); // Limit length
      continue;
    }

    // Keep primitives
    if (['boolean', 'number'].includes(typeof value) || value === null) {
      sanitized[key] = value;
      continue;
    }

    // For objects, only allow specific safe structures
    if (typeof value === 'object' && value !== null) {
      // Only shallow copy allowed keys
      if (key === 'studyPlan' || key === 'sessionConfig') {
        sanitized[key] = JSON.parse(JSON.stringify(value));
      }
    }
  }

  return sanitized;
}

/**
 * Validate session ID format (UUID or safe string)
 */
function isValidSessionId(sessionId: string): boolean {
  // Allow UUID format or alphanumeric with dashes/underscores
  return /^[a-zA-Z0-9-_{}]{1,100}$/.test(sessionId);
}

/**
 * Validate study plan ID format
 */
function isValidStudyPlanId(planId: string): boolean {
  // Similar validation to session ID
  return /^[a-zA-Z0-9-_{}]{1,100}$/.test(planId);
}

export * from "./navigation-helpers.types";
export * from "./navigation-helpers.part1";
export * from "./navigation-helpers.part2";
