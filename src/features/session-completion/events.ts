export interface EventMetadata {
  correlationId?: string;
  source?: string;
  timestamp: number;
}

export interface DeviceInfo {
  appVersion?: string;
  platform?: string;
}

export interface BaseSessionCompletionEvent {
  data: Record<string, unknown>;
  metadata?: EventMetadata;
  sessionId: string;
  type: string;
  userId: string;
}

export interface SessionCompletedEvent extends BaseSessionCompletionEvent {
  type: 'session_completed';
}
export interface SessionAbortedEvent extends BaseSessionCompletionEvent {
  type: 'session_aborted';
}
export interface SessionTimeoutEvent extends BaseSessionCompletionEvent {
  type: 'session_timeout';
}
export interface SessionPerformanceCalculatedEvent extends BaseSessionCompletionEvent {
  type: 'session_performance_calculated';
}
export interface SessionMilestoneReachedEvent extends BaseSessionCompletionEvent {
  type: 'session_milestone_reached';
}
export interface SessionRecordBrokenEvent extends BaseSessionCompletionEvent {
  type: 'session_record_broken';
}
export interface SessionAchievementUnlockedEvent extends BaseSessionCompletionEvent {
  type: 'session_achievement_unlocked';
}
export interface SessionAchievementProgressUpdatedEvent extends BaseSessionCompletionEvent {
  type: 'session_achievement_progress_updated';
}
export interface SessionAnalyticsGeneratedEvent extends BaseSessionCompletionEvent {
  type: 'session_analytics_generated';
}
export interface SessionPerformanceReportEvent extends BaseSessionCompletionEvent {
  type: 'session_performance_report';
}

export interface SessionRewardsCalculatedEvent extends BaseSessionCompletionEvent {
  type: 'session_rewards_calculated';
  data: {
    baseRewards: { experience: number; currency: number; reputation: number; energy: number };
    performanceBonus: { multiplier: number; bonus: { experience: number; currency: number; reputation: number }; criteria: string[] };
    completionBonus: { multiplier: number; bonus: { experience: number; currency: number; reputation: number }; objectives: string[] };
    specialRewards: { type: string; name: string; value: number; rarity: string; condition: string }[];
    totalRewards: { experience: number; currency: number; reputation: number; items: unknown[] };
  };
}

export interface SessionRewardsClaimedEvent extends BaseSessionCompletionEvent {
  type: 'session_rewards_claimed';
  data: {
    claimedAt: Date; claimMethod: 'auto' | 'manual' | 'delayed';
    rewards: { experience: number; currency: number; reputation: number; items: unknown[] };
    multipliers: { active: unknown[]; applied: unknown[]; expired: unknown[] };
    bonuses: { streak: unknown; performance: unknown; completion: unknown; special: unknown[] };
    inventory: { previous: unknown; current: unknown; overflow: unknown };
  };
}

export interface SessionRewardMultiplierActivatedEvent extends BaseSessionCompletionEvent {
  type: 'session_reward_multiplier_activated';
  data: {
    multiplierId: string; multiplierType: string; multiplierValue: number; duration: number; activatedAt: Date;
    trigger: { type: string; condition: string; value: unknown };
    scope: { sessions: string[]; rewards: string[]; conditions: unknown[] };
    cost: { type: string; amount: number; source: string };
    benefits: { estimated: number; actual?: number; efficiency: number };
  };
}

export interface SessionFeedbackRequestedEvent extends BaseSessionCompletionEvent {
  type: 'session_feedback_requested';
  data: {
    feedbackType: 'rating' | 'survey' | 'comment' | 'suggestion' | 'bug_report';
    requestedAt: Date;
    context: { sessionType: string; performance: number; completion: boolean; experience: string };
    questions: { id: string; type: string; question: string; required: boolean; options?: string[] }[];
    incentives: { type: string; value: number; condition: string };
    timing: { immediate: boolean; delay: number; deadline?: Date };
  };
}

export interface SessionFeedbackSubmittedEvent extends BaseSessionCompletionEvent {
  type: 'session_feedback_submitted';
  data: {
    feedbackId: string; feedbackType: string; submittedAt: Date;
    responses: { questionId: string; answer: unknown; timeSpent: number }[];
    rating?: number; comment?: string; sentiment?: 'positive' | 'neutral' | 'negative';
    context: { device: string; location?: string; sessionState: string };
    followUp: { requested: boolean; contactMethod?: string; availability?: string };
  };
}

export interface SessionSharedEvent extends BaseSessionCompletionEvent {
  type: 'session_shared';
  data: {
    shareType: 'achievement' | 'record' | 'milestone' | 'completion' | 'performance';
    sharedAt: Date; platform: string;
    content: { title: string; description: string; image?: string; video?: string; stats: unknown };
    audience: { type: 'public' | 'friends' | 'group' | 'private'; recipients?: string[] };
    engagement: { views: number; likes: number; comments: number; shares: number };
    rewards: { experience: number; currency: number; social: number };
  };
}

export interface SessionComparedEvent extends BaseSessionCompletionEvent {
  type: 'session_compared';
  data: {
    comparisonType: 'peer' | 'friend' | 'leaderboard' | 'global' | 'historical';
    comparisonTarget: string;
    metrics: { user: number; target: number; difference: number; percentage: number; rank: number; percentile: number }[];
    insights: { strengths: string[]; weaknesses: string[]; opportunities: string[]; recommendations: string[] };
    motivation: { encouragement: string; challenge: string; nextSteps: string[] };
  };
}

export interface SessionSystemMaintenanceEvent extends BaseSessionCompletionEvent {
  type: 'session_system_maintenance';
  data: {
    maintenanceType: 'scheduled' | 'emergency' | 'upgrade' | 'migration';
    startTime: Date; endTime?: Date; duration?: number; affectedServices: string[];
    impact: { completion: boolean; rewards: boolean; analytics: boolean; achievements: boolean };
    message: string; initiatedBy: string;
  };
}

export interface SessionSystemErrorEvent extends BaseSessionCompletionEvent {
  type: 'session_system_error';
  data: {
    errorType: 'completion_error' | 'reward_error' | 'analytics_error' | 'system_error';
    errorCode: string; errorMessage: string; severity: 'low' | 'medium' | 'high' | 'critical';
    context: { service: string; operation: string; userId: string; sessionId: string };
    stackTrace?: string; affectedUsers: number; recoveryAction: string;
    compensation: { type: string; amount: number; description: string };
  };
}

export type SessionCompletionEventType =
  | SessionCompletedEvent | SessionAbortedEvent | SessionTimeoutEvent
  | SessionPerformanceCalculatedEvent | SessionMilestoneReachedEvent | SessionRecordBrokenEvent
  | SessionRewardsCalculatedEvent | SessionRewardsClaimedEvent | SessionRewardMultiplierActivatedEvent
  | SessionAchievementUnlockedEvent | SessionAchievementProgressUpdatedEvent
  | SessionAnalyticsGeneratedEvent | SessionPerformanceReportEvent
  | SessionFeedbackRequestedEvent | SessionFeedbackSubmittedEvent
  | SessionSharedEvent | SessionComparedEvent
  | SessionSystemMaintenanceEvent | SessionSystemErrorEvent;
