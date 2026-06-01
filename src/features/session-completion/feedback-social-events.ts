import type { BaseSessionCompletionEvent } from './base-event-types';

export interface SessionFeedbackRequestedEvent
  extends BaseSessionCompletionEvent {
  type: 'session_feedback_requested';
  data: {
    feedbackType: 'rating' | 'survey' | 'comment' | 'suggestion' | 'bug_report';
    requestedAt: Date;
    context: {
      sessionType: string;
      performance: number;
      completion: boolean;
      experience: string;
    };
    questions: {
      id: string;
      type: string;
      question: string;
      required: boolean;
      options?: string[];
    }[];
    incentives: { type: string; value: number; condition: string };
    timing: { immediate: boolean; delay: number; deadline?: Date };
  };
}

export interface SessionFeedbackSubmittedEvent
  extends BaseSessionCompletionEvent {
  type: 'session_feedback_submitted';
  data: {
    feedbackId: string;
    feedbackType: string;
    submittedAt: Date;
    responses: { questionId: string; answer: unknown; timeSpent: number }[];
    rating?: number;
    comment?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    context: { device: string; location?: string; sessionState: string };
    followUp: {
      requested: boolean;
      contactMethod?: string;
      availability?: string;
    };
  };
}

export interface SessionSharedEvent extends BaseSessionCompletionEvent {
  type: 'session_shared';
  data: {
    shareType:
      | 'achievement'
      | 'record'
      | 'milestone'
      | 'completion'
      | 'performance';
    sharedAt: Date;
    platform: string;
    content: {
      title: string;
      description: string;
      image?: string;
      video?: string;
      stats: unknown;
    };
    audience: {
      type: 'public' | 'friends' | 'group' | 'private';
      recipients?: string[];
    };
    engagement: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    };
    rewards: { experience: number; currency: number; social: number };
  };
}

export interface SessionComparedEvent extends BaseSessionCompletionEvent {
  type: 'session_compared';
  data: {
    comparisonType: 'peer' | 'friend' | 'leaderboard' | 'global' | 'historical';
    comparisonTarget: string;
    metrics: {
      user: number;
      target: number;
      difference: number;
      percentage: number;
      rank: number;
      percentile: number;
    }[];
    insights: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      recommendations: string[];
    };
    motivation: {
      encouragement: string;
      challenge: string;
      nextSteps: string[];
    };
  };
}
