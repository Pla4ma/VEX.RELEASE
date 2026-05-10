/**
 * useAnalytics Hook
 *
 * React hook for analytics tracking.
 */

import { useCallback, useRef, useEffect } from 'react';
import { getAnalyticsService } from '../AnalyticsService';

/**
 * Analytics hook return type
 */
interface UseAnalyticsReturn {
  /** Track event */
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  /** Track screen view */
  screen: (screenName: string, properties?: Record<string, unknown>) => void;
  /** Set user properties */
  setProperties: (properties: Record<string, unknown>) => void;
  /** Capture exception (Sentry integration) */
  capture: (error: Error, context?: Record<string, unknown>) => void;
}

/**
 * Hook for analytics tracking
 */
export function useAnalytics(): UseAnalyticsReturn {
  const analytics = getAnalyticsService();
  const trackedScreens = useRef<Set<string>>(new Set());

  /**
   * Track event
   */
  const track = useCallback(
    (eventName: string, properties?: Record<string, unknown>): void => {
      analytics.track(eventName, properties);
    },
    [analytics]
  );

  /**
   * Track screen view
   */
  const screen = useCallback(
    (screenName: string, properties?: Record<string, unknown>): void => {
      // Prevent duplicate tracking
      const key = `${screenName}-${JSON.stringify(properties)}`;
      if (trackedScreens.current.has(key)) {return;}

      trackedScreens.current.add(key);
      analytics.screen(screenName, properties);
    },
    [analytics]
  );

  /**
   * Set user properties
   */
  const setProperties = useCallback(
    (properties: Record<string, unknown>): void => {
      analytics.setUserProperties(properties);
    },
    [analytics]
  );

  /**
   * Capture exception for error tracking
   */
  const capture = useCallback(
    (error: Error, context?: Record<string, unknown>): void => {
      // Track as error event with context
      analytics.track('exception_captured', {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      });
    },
    [analytics]
  );

  // Clear tracked screens on unmount
  useEffect(() => {
    const trackedScreenKeys = trackedScreens.current;
    return () => {
      trackedScreenKeys.clear();
    };
  }, []);

  return {
    track,
    screen,
    setProperties,
    capture,
  };
}

/**
 * Hook to track screen views
 */
export function useScreenTracking(
  screenName: string,
  properties?: Record<string, unknown>
): void {
  const analytics = getAnalyticsService();

  useEffect(() => {
    analytics.screen(screenName, properties);
  }, [analytics, screenName, properties]);
}
