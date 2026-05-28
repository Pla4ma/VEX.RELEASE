// Domain event constants
export {
  AuthEvents,
  SessionEvents,
  ProgressionEvents,
  FeatureEvents,
  OnboardingEvents,
} from "./core-events";
export type {
  AuthEvent,
  SessionEvent,
  ProgressionEvent,
  FeatureEvent,
  OnboardingEvent,
} from "./core-events";

export { EconomyEvents, RewardEvents, PurchaseFunnelEvents } from "./economy-events";
export type {
  EconomyEvent,
  PurchaseEvent,
  RewardEvent,
  PurchaseFunnelEvent,
} from "./economy-events";

export {
  SocialEvents,
  CoachEvents,
  StreakEvents,
  RetentionEvents,
} from "./social-events";
export type {
  SocialEvent,
  CoachEvent,
  StreakEvent,
  RetentionEvent,
} from "./social-events";

// Event property interfaces
export {
  BaseEventProperties,
  AuthEventProperties,
  SessionEventProperties,
  ProgressionEventProperties,
  EconomyEventProperties,
  SocialEventProperties,
  CoachEventProperties,
  EventProperties,
} from "./analytics-event-properties";

// Aggregate
import { AuthEvents, SessionEvents, ProgressionEvents, FeatureEvents, OnboardingEvents } from "./core-events";
import { EconomyEvents, PurchaseFunnelEvents } from "./economy-events";
import { SocialEvents, CoachEvents, RetentionEvents } from "./social-events";
import type { AuthEvent, SessionEvent, ProgressionEvent, FeatureEvent, OnboardingEvent } from "./core-events";
import type { EconomyEvent, PurchaseFunnelEvent } from "./economy-events";
import type { SocialEvent, CoachEvent, RetentionEvent } from "./social-events";

export const AnalyticsEvents = {
  ...AuthEvents,
  ...SessionEvents,
  ...ProgressionEvents,
  ...EconomyEvents,
  ...SocialEvents,
  ...CoachEvents,
  ...FeatureEvents,
  ...OnboardingEvents,
  ...PurchaseFunnelEvents,
  ...RetentionEvents,
} as const;

export type AnalyticsEvent =
  | AuthEvent
  | SessionEvent
  | ProgressionEvent
  | EconomyEvent
  | SocialEvent
  | CoachEvent
  | FeatureEvent
  | OnboardingEvent
  | PurchaseFunnelEvent
  | RetentionEvent
  | "funnel_step_completed"
  | "retention_event"
  | "subscription_cancelled"
  | "alert_triggered"
  | "exception_captured"
  | "session_configured"
  | "coach_cta_effectiveness";
