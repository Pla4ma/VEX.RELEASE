import type {
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

export interface UseAnalyticsReturn {
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
