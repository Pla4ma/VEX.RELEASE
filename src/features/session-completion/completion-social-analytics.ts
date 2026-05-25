import { capture } from '../../shared/analytics/analytics-service';

export function trackSessionFeedbackRequested(
  userId: string,
  sessionId: string,
  feedbackType: 'rating' | 'survey' | 'comment' | 'suggestion' | 'bug_report',
  requestedAt: Date,
  context: {
    sessionType: string;
    performance: number;
    completion: boolean;
    experience: string;
  },
  questions: {
    id: string;
    type: string;
    question: string;
    required: boolean;
    options?: string[];
  }[],
  incentives: {
    type: string;
    value: number;
    condition: string;
  },
  timing: {
    immediate: boolean;
    delay: number;
    deadline?: Date;
  },
): void {
  capture('session_completion_feedback_requested', {
    user_id: userId,
    session_id: sessionId,
    feedback_type: feedbackType,
    requested_at: requestedAt.toISOString(),
    context,
    questions,
    incentives,
    timing: {
      ...timing,
      deadline: timing.deadline?.toISOString(),
    },
  });
}

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

// ============================================================================
// SOCIAL ANALYTICS
// ============================================================================

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

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

