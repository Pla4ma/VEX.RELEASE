import { capture } from "../../shared/analytics/analytics-service";


export function trackSessionFeedbackSubmitted(
  userId: string,
  sessionId: string,
  feedbackId: string,
  feedbackType: string,
  submittedAt: Date,
  responses: {
    questionId: string;
    answer: unknown;
    timeSpent: number;
  }[],
  rating?: number,
  comment?: string,
  sentiment?: 'positive' | 'neutral' | 'negative',
  context?: {
    device: string;
    location?: string;
    sessionState: string;
  },
  followUp?: {
    requested: boolean;
    contactMethod?: string;
    availability?: string;
  },
): void {
  capture('session_completion_feedback_submitted', {
    user_id: userId,
    session_id: sessionId,
    feedback_id: feedbackId,
    feedback_type: feedbackType,
    submitted_at: submittedAt.toISOString(),
    responses,
    rating,
    comment,
    sentiment,
    context,
    followUp,
  });
}

export function trackSessionShared(
  userId: string,
  sessionId: string,
  shareType: 'achievement' | 'record' | 'milestone' | 'completion' | 'performance',
  sharedAt: Date,
  platform: string,
  content: {
    title: string;
    description: string;
    image?: string;
    video?: string;
    stats: unknown;
  },
  audience: {
    type: 'public' | 'friends' | 'group' | 'private';
    recipients?: string[];
  },
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  },
  rewards: {
    experience: number;
    currency: number;
    social: number;
  },
): void {
  capture('session_completion_shared', {
    user_id: userId,
    session_id: sessionId,
    share_type: shareType,
    shared_at: sharedAt.toISOString(),
    platform,
    content,
    audience,
    engagement,
    rewards,
  });
}

export function trackSessionCompared(
  userId: string,
  sessionId: string,
  comparisonType: 'peer' | 'friend' | 'leaderboard' | 'global' | 'historical',
  comparisonTarget: string,
  metrics: {
    user: number;
    target: number;
    difference: number;
    percentage: number;
    rank: number;
    percentile: number;
  }[],
  insights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    recommendations: string[];
  },
  motivation: {
    encouragement: string;
    challenge: string;
    nextSteps: string[];
  },
): void {
  capture('session_completion_compared', {
    user_id: userId,
    session_id: sessionId,
    comparison_type: comparisonType,
    comparison_target: comparisonTarget,
    metrics,
    insights,
    motivation,
  });
}

export function trackSessionCompletionDashboardViewed(
  userId: string,
  dashboardType: 'overview' | 'session_detail' | 'progress' | 'achievements' | 'rewards',
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