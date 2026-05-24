/**
 * Retention Events
 */

export interface RetentionEventDefinitions {
  'near_miss:shown': {
    userId: string;
    streakDays?: number;
    hoursRemaining?: number;
    trigger?: string;
    interventionId?: string;
    urgency?: string;
  };
  'near_miss:incentive_claimed': {
    userId: string;
    incentiveType?: string;
    value?: number;
    interventionId?: string;
    incentive?: unknown;
  };
  'near_miss:resolved': {
    userId: string;
    streakPreserved?: boolean;
    method?: string;
    interventionId?: string;
    action?: string;
  };
  'near_miss:analytics': {
    userId?: string;
    event?: string;
    data?: Record<string, unknown>;
    interventionId?: string;
    trigger?: string;
    outcome?: string;
  };
}
