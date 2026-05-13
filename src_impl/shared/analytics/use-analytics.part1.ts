import { useCallback, useEffect, useRef } from "react";
import { analyticsService, capture, identify, reset, updateUserProperties } from "./analytics-service";
import { AnalyticsEvent, EventProperties, AuthEvents, SessionEvents, ProgressionEvents, EconomyEvents, SocialEvents, CoachEvents, FeatureEvents } from "./analytics-events";


export function useAnalytics(): UseAnalyticsReturn {
  // Use refs to maintain stable references across renders
  const serviceRef = useRef(analyticsService);

  // Core track method
  const track = useCallback((eventName: AnalyticsEvent, properties?: EventProperties) => {
    capture(eventName, properties);
  }, []);

  // Feature-specific track methods
  const trackAuth = useCallback((event: typeof AuthEvents[keyof typeof AuthEvents], properties?: EventProperties) => {
    capture(event, properties);
  }, []);

  const trackSession = useCallback((event: typeof SessionEvents[keyof typeof SessionEvents], properties?: EventProperties) => {
    capture(event, properties);
  }, []);

  const trackProgression = useCallback((event: typeof ProgressionEvents[keyof typeof ProgressionEvents], properties?: EventProperties) => {
    capture(event, properties);
  }, []);

  const trackEconomy = useCallback((event: typeof EconomyEvents[keyof typeof EconomyEvents], properties?: EventProperties) => {
    capture(event, properties);
  }, []);

  const trackSocial = useCallback((event: typeof SocialEvents[keyof typeof SocialEvents], properties?: EventProperties) => {
    capture(event, properties);
  }, []);

  const trackCoach = useCallback((event: typeof CoachEvents[keyof typeof CoachEvents], properties?: EventProperties) => {
    capture(event, properties);
  }, []);

  const trackFeature = useCallback((event: typeof FeatureEvents[keyof typeof FeatureEvents], properties?: EventProperties) => {
    capture(event, properties);
  }, []);

  // User management
  const identifyUser = useCallback((userId: string, traits?: { email?: string; name?: string; level?: number }) => {
    identify(userId, traits);
  }, []);

  const resetUser = useCallback(() => {
    reset();
  }, []);

  const updateUser = useCallback((traits: { level?: number; streak?: number; [key: string]: unknown }) => {
    // Filter to only valid trait types
    const cleanTraits = Object.fromEntries(
      Object.entries(traits).filter(([, v]) =>
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
      )
    ) as { level?: number; streak?: number };

    updateUserProperties(cleanTraits);
  }, []);

  // Screen tracking
  const trackScreen = useCallback((screenName: string, properties?: Record<string, string | number | boolean>) => {
    serviceRef.current.screen(screenName, properties);
  }, []);

  // Error capture
  const captureError = useCallback((error: Error, context?: Record<string, unknown>) => {
    capture('exception_captured', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }, []);

  return {
    track,
    trackAuth,
    trackSession,
    trackProgression,
    trackEconomy,
    trackSocial,
    trackCoach,
    trackFeature,
    identifyUser,
    resetUser,
    updateUser,
    trackScreen,
    capture: captureError,
    isEnabled: serviceRef.current.isEnabled(),
  };
}

export function useScreenTracking(
  screenName: string,
  properties?: Record<string, string | number | boolean>
): void {
  const serviceRef = useRef(analyticsService);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      serviceRef.current.screen(screenName, properties);
      hasTracked.current = true;
    }
  }, [screenName, properties]);
}

export function useProgressionTracking(
  level: number,
  streak: number,
  xp: number
): void {
  const previousLevel = useRef(level);
  const previousStreak = useRef(streak);
  const { trackProgression } = useAnalytics();

  useEffect(() => {
    // Track level up
    if (level > previousLevel.current) {
      trackProgression(ProgressionEvents.LEVEL_UP, {
        previous_level: previousLevel.current,
        new_level: level,
      });
      previousLevel.current = level;
    }

    // Track streak update
    if (streak !== previousStreak.current) {
      trackProgression(ProgressionEvents.STREAK_UPDATED, {
        previous_streak: previousStreak.current,
        streak_days: streak,
      });
      previousStreak.current = streak;
    }
  }, [level, streak, xp, trackProgression]);
}

export function useSessionTracking(
  sessionId: string | null,
  isActive: boolean,
  sessionType: 'focus' | 'boss' | 'challenge'
): void {
  const { trackSession } = useAnalytics();
  const startTime = useRef<number | null>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    if (isActive && !wasActive.current && sessionId) {
      // Session started
      startTime.current = Date.now();
      trackSession(SessionEvents.SESSION_STARTED, {
        session_id: sessionId,
        session_type: sessionType,
      });
      wasActive.current = true;
    } else if (!isActive && wasActive.current && sessionId) {
      // Session ended
      const duration = startTime.current ? (Date.now() - startTime.current) / 1000 : 0;
      trackSession(SessionEvents.SESSION_COMPLETED, {
        session_id: sessionId,
        session_type: sessionType,
        duration_seconds: duration,
      });
      wasActive.current = false;
      startTime.current = null;
    }
  }, [isActive, sessionId, sessionType, trackSession]);
}