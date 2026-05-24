import { capture } from '../../shared/analytics/analytics-service';

export function trackStoryDashboardViewed(
  userId: string,
  dashboardType: 'overview' | 'story_detail' | 'choices' | 'characters' | 'world',
  filters: {
    timeframe: string;
    genre: string[];
    theme: string[];
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
  capture('session_story_dashboard_viewed', {
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

export function trackStoryUserProperties(
  userId: string,
  userProperties: {
    totalStories: number;
    completedStories: number;
    averageCompletion: number;
    averageEngagement: number;
    totalChoices: number;
    averageTimePerStory: number;
    preferredGenre: string;
    preferredTheme: string;
    favoriteCharacterType: string;
    achievementCount: number;
    totalMilestones: number;
    storyComplexityPreference: string;
  },
): void {
  capture('session_story_user_properties', {
    user_id: userId,
    total_stories: userProperties.totalStories,
    completed_stories: userProperties.completedStories,
    average_completion: userProperties.averageCompletion,
    average_engagement: userProperties.averageEngagement,
    total_choices: userProperties.totalChoices,
    average_time_per_story: userProperties.averageTimePerStory,
    preferred_genre: userProperties.preferredGenre,
    preferred_theme: userProperties.preferredTheme,
    favorite_character_type: userProperties.favoriteCharacterType,
    achievement_count: userProperties.achievementCount,
    total_milestones: userProperties.totalMilestones,
    story_complexity_preference: userProperties.storyComplexityPreference,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export function trackStoryError(
  userId: string,
  errorType: 'generation_error' | 'progression_error' | 'choice_error' | 'analytics_error' | 'system_error',
  errorCode: string,
  errorMessage: string,
  context: {
    service: string;
    operation: string;
    userId: string;
    sessionId: string;
    storyId?: string;
  },
): void {
  capture('session_story_error', {
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

export function trackStoryFunnel(userId: string, step: 'story_generated' | 'story_started' | 'first_choice' | 'chapter_completed' | 'story_completed' | 'achievement_unlocked'): void {
  capture('session_story_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
