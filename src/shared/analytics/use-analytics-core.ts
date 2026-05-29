import { useCallback, useRef } from "react";
import {
  analyticsService,
  capture,
  identify,
  reset,
  updateUserProperties,
} from "./analytics-service";
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
} from "./analytics-events";
interface UseAnalyticsReturn {
  track: (eventName: AnalyticsEvent, properties?: EventProperties) => void;
  trackAuth: (
    event: (typeof AuthEvents)[keyof typeof AuthEvents],
    properties?: EventProperties,
  ) => void;
  trackSession: (
    event: (typeof SessionEvents)[keyof typeof SessionEvents],
    properties?: EventProperties,
  ) => void;
  trackProgression: (
    event: (typeof ProgressionEvents)[keyof typeof ProgressionEvents],
    properties?: EventProperties,
  ) => void;
  trackEconomy: (
    event: (typeof EconomyEvents)[keyof typeof EconomyEvents],
    properties?: EventProperties,
  ) => void;
  trackSocial: (
    event: (typeof SocialEvents)[keyof typeof SocialEvents],
    properties?: EventProperties,
  ) => void;
  trackCoach: (
    event: (typeof CoachEvents)[keyof typeof CoachEvents],
    properties?: EventProperties,
  ) => void;
  trackFeature: (
    event: (typeof FeatureEvents)[keyof typeof FeatureEvents],
    properties?: EventProperties,
  ) => void;
  identifyUser: (
    userId: string,
    traits?: { email?: string; name?: string; level?: number },
  ) => void;
  resetUser: () => void;
  updateUser: (traits: {
    level?: number;
    streak?: number;
    [key: string]: unknown;
  }) => void;
  trackScreen: (
    screenName: string,
    properties?: Record<string, string | number | boolean>,
  ) => void;
  capture: (error: Error, context?: Record<string, unknown>) => void;
  isEnabled: boolean;
}

export function useAnalytics(): UseAnalyticsReturn {
  const serviceRef = useRef(analyticsService);
  const track = useCallback(
    (eventName: AnalyticsEvent, properties?: EventProperties) => {
      capture(eventName, properties);
    },
    [],
  );
  const trackAuth = useCallback(
    (
      event: (typeof AuthEvents)[keyof typeof AuthEvents],
      properties?: EventProperties,
    ) => {
      capture(event, properties);
    },
    [],
  );
  const trackSession = useCallback(
    (
      event: (typeof SessionEvents)[keyof typeof SessionEvents],
      properties?: EventProperties,
    ) => {
      capture(event, properties);
    },
    [],
  );
  const trackProgression = useCallback(
    (
      event: (typeof ProgressionEvents)[keyof typeof ProgressionEvents],
      properties?: EventProperties,
    ) => {
      capture(event, properties);
    },
    [],
  );
  const trackEconomy = useCallback(
    (
      event: (typeof EconomyEvents)[keyof typeof EconomyEvents],
      properties?: EventProperties,
    ) => {
      capture(event, properties);
    },
    [],
  );
  const trackSocial = useCallback(
    (
      event: (typeof SocialEvents)[keyof typeof SocialEvents],
      properties?: EventProperties,
    ) => {
      capture(event, properties);
    },
    [],
  );
  const trackCoach = useCallback(
    (
      event: (typeof CoachEvents)[keyof typeof CoachEvents],
      properties?: EventProperties,
    ) => {
      capture(event, properties);
    },
    [],
  );
  const trackFeature = useCallback(
    (
      event: (typeof FeatureEvents)[keyof typeof FeatureEvents],
      properties?: EventProperties,
    ) => {
      capture(event, properties);
    },
    [],
  );
  const identifyUser = useCallback(
    (
      userId: string,
      traits?: { email?: string; name?: string; level?: number },
    ) => {
      identify(userId, traits);
    },
    [],
  );
  const resetUser = useCallback(() => {
    reset();
  }, []);
  const updateUser = useCallback(
    (traits: { level?: number; streak?: number; [key: string]: unknown }) => {
      const cleanTraits = Object.fromEntries(
        Object.entries(traits).filter(
          ([, v]) =>
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean",
        ),
      ) as { level?: number; streak?: number };
      updateUserProperties(cleanTraits);
    },
    [],
  );
  const trackScreen = useCallback(
    (
      screenName: string,
      properties?: Record<string, string | number | boolean>,
    ) => {
      serviceRef.current.screen(screenName, properties);
    },
    [],
  );
  const captureError = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      capture("exception_captured", {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      });
    },
    [],
  );
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