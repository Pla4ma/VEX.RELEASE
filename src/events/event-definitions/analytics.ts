/**
 * Analytics Event Definitions
 *
 * Event interfaces for analytics tracking: custom events, screen views,
 * and user properties.
 */

export type AnalyticsEventType =
  | "analytics:track"
  | "analytics:screen_view"
  | "analytics:user_property";

export interface AnalyticsTrackEvent {
  event: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  sessionId?: string;
}

export interface AnalyticsScreenViewEvent {
  screen: string;
  screenClass?: string;
  userId?: string;
  properties?: Record<string, unknown>;
}
