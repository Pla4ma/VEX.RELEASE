

export const PurchaseFunnelEvents = {
  PAYWALL_VIEWED: 'paywall_viewed',
  PACKAGE_SELECTED: 'package_selected',
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_SUCCEEDED: 'purchase_succeeded',
  PURCHASE_FAILED: 'purchase_failed',
  PURCHASE_RESTORED: 'purchase_restored',
} as const;

export const RetentionEvents = {
  STREAK_MAINTAINED: 'streak_maintained',
  STREAK_RECOVERED: 'streak_recovered',
  RIVAL_WIDGET_VIEWED: 'rival_widget_viewed',
  SESSION_REMINDER_TRIGGERED: 'session_reminder_triggered',
  COMEBACK_OFFER_VIEWED: 'comeback_offer_viewed',
  COMEBACK_OFFER_ACCEPTED: 'comeback_offer_accepted',
} as const;

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