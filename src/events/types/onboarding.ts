/**
 * Onboarding Events
 */

export interface OnboardingEventDefinitions {
  "onboarding:started": {
    userId: string;
    timestamp?: number;
    [key: string]: unknown;
  };
  "onboarding:completed": {
    userId: string;
    timestamp?: number;
    [key: string]: unknown;
  };
  "onboarding:step_changed": {
    userId: string;
    step: string;
    previousStep?: string;
    timestamp?: number;
    [key: string]: unknown;
  };
  "onboarding:skipped": {
    userId: string;
    step: string;
    reason?: string;
    timestamp?: number;
    [key: string]: unknown;
  };
  "onboarding:first_session_complete": {
    userId: string;
    sessionId?: string;
    durationMinutes?: number;
    timestamp?: number;
    [key: string]: unknown;
  };
  "onboarding:feature_unlocked": {
    userId: string;
    feature: string;
    featureId?: string;
    timestamp?: number;
    [key: string]: unknown;
  };
}
