/**
 * Feedback Events
 */

export interface FeedbackEventDefinitions {
  "feedback:visual": {
    userId?: string;
    type: string;
    intensity?: "low" | "medium" | "high";
    timestamp?: number;
  };
}
