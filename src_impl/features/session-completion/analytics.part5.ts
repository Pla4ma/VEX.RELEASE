import { capture } from "../../shared/analytics/analytics-service";


export function trackSessionCompletionError(
  userId: string,
  errorType: 'completion_error' | 'reward_error' | 'analytics_error' | 'system_error',
  errorCode: string,
  errorMessage: string,
  context: {
    service: string;
    operation: string;
    userId: string;
    sessionId: string;
  },
): void {
  capture('session_completion_error', {
    user_id: userId,
    error_type: errorType,
    error_code: errorCode,
    error_message: errorMessage,
    error_context: context,
  });
}

export function trackSessionCompletionFunnel(userId: string, step: 'session_started' | 'objectives_met' | 'performance_calculated' | 'rewards_earned' | 'achievement_unlocked' | 'completed'): void {
  capture('session_completion_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}