/**
 * Subscription Events
 */

export interface SubscriptionEventDefinitions {
  "subscription:changed": {
    userId: string;
    previousTier?: string;
    newTier?: string;
    tier?: string;
    previousFeatures?: string[];
    newFeatures?: string[];
    downgradedFeatures?: string[];
    timestamp?: number;
    [key: string]: unknown;
  };
}
