/**
 * useAnalytics Hook
 *
 * React hook for analytics usage in UI layer.
 * Wraps analytics service calls to prevent direct PostHog usage in components.
 *
 * Rules:
 * - Use this hook instead of direct service calls
 * - Track events from effect hooks or callback handlers
 * - Don't track every click - only meaningful actions
 */

import { useCallback, useEffect, useRef } from 'react';
import { analyticsService, capture, identify, reset, updateUserProperties } from './analytics-service';
import {
  AnalyticsEvent,
  EventProperties,
  AuthEvents,
  SessionEvents,
  ProgressionEvents,
  EconomyEvents,
  SocialEvents,
  CoachEvents,
  FeatureEvents,
} from './analytics-events';

// ============================================================================
// Hook Return Type
// ============================================================================

interface UseAnalyticsReturn {
  // Core tracking
  track: (eventName: AnalyticsEvent, properties?: EventProperties) => void;

  // Feature-specific helpers
  trackAuth: (event: typeof AuthEvents[keyof typeof AuthEvents], properties?: EventProperties) => void;
  trackSession: (event: typeof SessionEvents[keyof typeof SessionEvents], properties?: EventProperties) => void;
  trackProgression: (event: typeof ProgressionEvents[keyof typeof ProgressionEvents], properties?: EventProperties) => void;
  trackEconomy: (event: typeof EconomyEvents[keyof typeof EconomyEvents], properties?: EventProperties) => void;
  trackSocial: (event: typeof SocialEvents[keyof typeof SocialEvents], properties?: EventProperties) => void;
  trackCoach: (event: typeof CoachEvents[keyof typeof CoachEvents], properties?: EventProperties) => void;
  trackFeature: (event: typeof FeatureEvents[keyof typeof FeatureEvents], properties?: EventProperties) => void;

  // User management
  identifyUser: (userId: string, traits?: { email?: string; name?: string; level?: number }) => void;
  resetUser: () => void;
  updateUser: (traits: { level?: number; streak?: number; [key: string]: unknown }) => void;

  // Screen tracking
  trackScreen: (screenName: string, properties?: Record<string, string | number | boolean>) => void;

  // Error tracking
  capture: (error: Error, context?: Record<string, unknown>) => void;

  // Status
  isEnabled: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================
// ============================================================================
// Specialized Hooks for Common Patterns
// ============================================================================
// ============================================================================
// Re-export event constants for convenience
// ============================================================================

export {
  AuthEvents,
  SessionEvents,
  ProgressionEvents,
  EconomyEvents,
  SocialEvents,
  CoachEvents,
  FeatureEvents,
};

// Re-export types
export type { AnalyticsEvent, EventProperties };
export * from "./use-analytics.types";
export * from "./use-analytics.types";
export * from "./use-analytics.part1";
