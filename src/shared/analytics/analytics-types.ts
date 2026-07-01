// Analytics type definitions — separated for file size compliance
export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
}

export type UserTraits = Record<string, unknown>;

export type PurchaseEvent = string;

export const RetentionEvents = {
  RETURN_SESSION: 'return_session' as const,
  COMEBACK_TRIGGERED: 'comeback_triggered' as const,
} as const;
