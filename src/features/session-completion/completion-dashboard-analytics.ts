import { capture } from '../../shared/analytics/analytics-service';

export function trackSessionCompletionDashboardViewed(
  userId: string,
  dashboardType:
    | 'overview'
    | 'session_detail'
    | 'progress'
    | 'achievements'
    | 'rewards',
  filters: {
    timeframe: string;
    sessionType: string[];
    performance: string[];
  },
  interactions: {
    viewDuration: number;
    interactions: string[];
    exports: string[];
    shares: string[];
  },
  context: {
    device: string;
    location?: string;
    role: string;
  },
): void {
  capture('session_completion_dashboard_viewed', {
    user_id: userId,
    dashboard_type: dashboardType,
    filters,
    interactions,
    context,
  });
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

export function trackSessionCompletionUserProperties(
  userId: string,
  userProperties: {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    bestScore: number;
    averageDuration: number;
    totalExperience: number;
    totalRewards: number;
    achievementsUnlocked: number;
    currentStreak: number;
    bestStreak: number;
    favoriteSessionType: string;
    preferredDifficulty: string;
  },
): void {
  capture('session_completion_user_properties', {
    user_id: userId,
    total_sessions: userProperties.totalSessions,
    completed_sessions: userProperties.completedSessions,
    average_score: userProperties.averageScore,
    best_score: userProperties.bestScore,
    average_duration: userProperties.averageDuration,
    total_experience: userProperties.totalExperience,
    total_rewards: userProperties.totalRewards,
    achievements_unlocked: userProperties.achievementsUnlocked,
    current_streak: userProperties.currentStreak,
    best_streak: userProperties.bestStreak,
    favorite_session_type: userProperties.favoriteSessionType,
    preferred_difficulty: userProperties.preferredDifficulty,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export function trackSessionCompletionError(
  userId: string,
  errorType:
    | 'completion_error'
    | 'reward_error'
    | 'analytics_error'
    | 'system_error',
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

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export function trackSessionCompletionFunnel(
  userId: string,
  step:
    | 'session_started'
    | 'objectives_met'
    | 'performance_calculated'
    | 'rewards_earned'
    | 'achievement_unlocked'
    | 'completed',
): void {
  capture('session_completion_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
