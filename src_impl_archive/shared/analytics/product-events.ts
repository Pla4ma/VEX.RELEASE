export const ProductAnalyticsEvents = {
  APP_OPENED: 'app_opened',
  ERROR_OCCURRED: 'error_occurred',
  CORE_FLOW_ABANDONED: 'core_flow_abandoned',
  SETTINGS_CHANGED: 'settings_changed',
} as const;

export type ProductAnalyticsEvent =
  typeof ProductAnalyticsEvents[keyof typeof ProductAnalyticsEvents];
