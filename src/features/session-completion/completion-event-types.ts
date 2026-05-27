export interface BaseSessionCompletionEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata: EventMetadata;
}
export interface EventMetadata {
  source: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  correlationId?: string;
}
export interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop" | "web";
  os: string;
  version: string;
  appVersion?: string;
}
export interface SessionCompletedEvent extends BaseSessionCompletionEvent {
  type: "session_completed";
  data: {
    completionType:
      | "natural"
      | "forced"
      | "abandoned"
      | "timeout"
      | "achievement";
    completionTime: Date;
    duration: number;
    objectives: {
      total: number;
      completed: number;
      failed: number;
      skipped: number;
      percentage: number;
    };
    performance: {
      overallScore: number;
      accuracy: number;
      efficiency: number;
      speed: number;
      consistency: number;
    };
    conditions: {
      success: boolean;
      failureReason?: string;
      completionCriteria: string[];
      metCriteria: string[];
      missedCriteria: string[];
    };
  };
}
export interface SessionAbortedEvent extends BaseSessionCompletionEvent {
  type: "session_aborted";
  data: {
    abortTime: Date;
    duration: number;
    progress: {
      percentage: number;
      objectivesCompleted: number;
      totalObjectives: number;
      currentPhase: string;
    };
    abortReason:
      | "user_choice"
      | "technical_error"
      | "timeout"
      | "emergency"
      | "system_intervention";
    abortContext: { trigger: string; userState: string; systemState: string };
    recovery: { resumable: boolean; dataPreserved: boolean; penalty: unknown };
  };
}
export interface SessionTimeoutEvent extends BaseSessionCompletionEvent {
  type: "session_timeout";
  data: {
    timeoutTime: Date;
    duration: number;
    timeLimit: number;
    progress: {
      percentage: number;
      objectivesCompleted: number;
      totalObjectives: number;
    };
    timeoutType: "soft" | "hard" | "grace_period";
    consequences: {
      scorePenalty: number;
      rewardReduction: number;
      experienceLoss: number;
    };
    extension: {
      available: boolean;
      granted: boolean;
      duration?: number;
      cost?: unknown;
    };
  };
}
export interface SessionPerformanceCalculatedEvent extends BaseSessionCompletionEvent {
  type: "session_performance_calculated";
  data: {
    performanceMetrics: {
      overall: {
        score: number;
        grade: string;
        percentile: number;
        rank: number;
      };
      categories: {
        accuracy: number;
        speed: number;
        efficiency: number;
        consistency: number;
        strategy: number;
        adaptation: number;
      };
      trends: {
        improvement: number;
        momentum: number;
        stability: number;
        potential: number;
      };
    };
    benchmarks: {
      personalBest: number;
      personalAverage: number;
      globalAverage: number;
      peerAverage: number;
      targetLevel: number;
    };
    analysis: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      insights: string[];
    };
  };
}
export interface SessionMilestoneReachedEvent extends BaseSessionCompletionEvent {
  type: "session_milestone_reached";
  data: {
    milestoneId: string;
    milestoneType:
      | "score"
      | "streak"
      | "accuracy"
      | "speed"
      | "completion"
      | "special";
    milestoneName: string;
    achievedAt: Date;
    value: number;
    target: number;
    previousRecord: number;
    improvement: number;
    significance: "personal" | "session" | "daily" | "weekly" | "all_time";
    recognition: {
      badge: string;
      title: string;
      celebration: boolean;
      shareable: boolean;
    };
    rewards: {
      experience: number;
      currency: number;
      items: unknown[];
      unlocks: string[];
    };
  };
}
export interface SessionRecordBrokenEvent extends BaseSessionCompletionEvent {
  type: "session_record_broken";
  data: {
    recordType: string;
    recordCategory: "personal" | "session" | "daily" | "weekly" | "global";
    previousRecord: number;
    newRecord: number;
    improvement: number;
    recordDate: Date;
    previousRecordDate: Date;
    timeSincePrevious: number;
    significance: { rarity: number; difficulty: number; achievement: number };
    celebration: {
      message: string;
      effects: string[];
      duration: number;
      public: boolean;
    };
  };
}
export interface SessionRewardsCalculatedEvent extends BaseSessionCompletionEvent {
  type: "session_rewards_calculated";
  data: {
    baseRewards: {
      experience: number;
      currency: number;
      reputation: number;
      energy: number;
    };
    performanceBonus: {
      multiplier: number;
      bonus: { experience: number; currency: number; reputation: number };
      criteria: string[];
    };
    completionBonus: {
      multiplier: number;
      bonus: { experience: number; currency: number; reputation: number };
      objectives: string[];
    };
    specialRewards: {
      type: string;
      name: string;
      value: number;
      rarity: string;
      condition: string;
    }[];
    totalRewards: {
      experience: number;
      currency: number;
      reputation: number;
      items: unknown[];
    };
  };
}
export interface SessionRewardsClaimedEvent extends BaseSessionCompletionEvent {
  type: "session_rewards_claimed";
  data: {
    claimedAt: Date;
    claimMethod: "auto" | "manual" | "delayed";
    rewards: {
      experience: number;
      currency: number;
      reputation: number;
      items: unknown[];
    };
    multipliers: { active: unknown[]; applied: unknown[]; expired: unknown[] };
    bonuses: {
      streak: unknown;
      performance: unknown;
      completion: unknown;
      special: unknown[];
    };
    inventory: { previous: unknown; current: unknown; overflow: unknown };
  };
}
export interface SessionRewardMultiplierActivatedEvent extends BaseSessionCompletionEvent {
  type: "session_reward_multiplier_activated";
  data: {
    multiplierId: string;
    multiplierType: string;
    multiplierValue: number;
    duration: number;
    activatedAt: Date;
    trigger: { type: string; condition: string; value: unknown };
    scope: { sessions: string[]; rewards: string[]; conditions: unknown[] };
    cost: { type: string; amount: number; source: string };
    benefits: { estimated: number; actual?: number; efficiency: number };
  };
}
export interface SessionAchievementUnlockedEvent extends BaseSessionCompletionEvent {
  type: "session_achievement_unlocked";
  data: {
    achievementId: string;
    achievementName: string;
    achievementType:
      | "completion"
      | "performance"
      | "streak"
      | "special"
      | "hidden";
    unlockedAt: Date;
    progress: { current: number; required: number; percentage: number };
    criteria: {
      type: string;
      condition: string;
      value: unknown;
      met: boolean;
    }[];
    rarity: string;
    points: number;
    rewards: {
      experience: number;
      currency: number;
      items: unknown[];
      titles: string[];
    };
    recognition: {
      badge: string;
      celebration: boolean;
      shareable: boolean;
      public: boolean;
    };
    firstTime: boolean;
    chainProgress?: {
      chainId: string;
      current: number;
      total: number;
      next: string;
    };
  };
}
export interface SessionAchievementProgressUpdatedEvent extends BaseSessionCompletionEvent {
  type: "session_achievement_progress_updated";
  data: {
    achievementId: string;
    previousProgress: number;
    currentProgress: number;
    requiredProgress: number;
    increment: number;
    contributingAction: string;
    context: { sessionId: string; objective: string; performance: unknown };
    nextMilestone?: { progress: number; reward: unknown; celebration: boolean };
    estimatedCompletion?: {
      sessions: number;
      timeframe: number;
      confidence: number;
    };
  };
}
export interface SessionAnalyticsGeneratedEvent extends BaseSessionCompletionEvent {
  type: "session_analytics_generated";
  data: {
    analyticsType:
      | "performance"
      | "progress"
      | "trends"
      | "predictions"
      | "insights";
    timeframe: string;
    metrics: Record<string, number>;
    dimensions: Record<string, unknown>;
    insights: {
      type: string;
      description: string;
      significance: string;
      recommendations: string[];
    }[];
    trends: {
      metric: string;
      direction: "up" | "down" | "stable";
      change: number;
      significance: string;
    }[];
    predictions: {
      metric: string;
      prediction: number;
      confidence: number;
      timeframe: number;
    }[];
    generatedAt: Date;
  };
}
export interface SessionPerformanceReportEvent extends BaseSessionCompletionEvent {
  type: "session_performance_report";
  data: {
    reportPeriod: { start: Date; end: Date };
    overview: {
      totalSessions: number;
      completedSessions: number;
      averageScore: number;
      bestScore: number;
      averageDuration: number;
      totalExperience: number;
      totalRewards: number;
    };
    performance: {
      byType: Record<string, unknown>;
      byDifficulty: Record<string, unknown>;
      byTimeframe: Record<string, unknown>;
      byObjective: Record<string, unknown>;
    };
    trends: {
      score: Array<{ date: Date; score: number }>;
      completion: Array<{ date: Date; rate: number }>;
      duration: Array<{ date: Date; time: number }>;
      rewards: Array<{ date: Date; amount: number }>;
    };
    insights: {
      strengths: string[];
      improvements: string[];
      opportunities: string[];
      recommendations: string[];
    };
    goals: {
      set: string[];
      achieved: string[];
      inProgress: string[];
      missed: string[];
    };
  };
}
export interface SessionFeedbackRequestedEvent extends BaseSessionCompletionEvent {
  type: "session_feedback_requested";
  data: {
    feedbackType: "rating" | "survey" | "comment" | "suggestion" | "bug_report";
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
export interface SessionFeedbackSubmittedEvent extends BaseSessionCompletionEvent {
  type: "session_feedback_submitted";
  data: {
    feedbackId: string;
    feedbackType: string;
    submittedAt: Date;
    responses: { questionId: string; answer: unknown; timeSpent: number }[];
    rating?: number;
    comment?: string;
    sentiment?: "positive" | "neutral" | "negative";
    context: { device: string; location?: string; sessionState: string };
    followUp: {
      requested: boolean;
      contactMethod?: string;
      availability?: string;
    };
  };
}
export interface SessionSharedEvent extends BaseSessionCompletionEvent {
  type: "session_shared";
  data: {
    shareType:
      | "achievement"
      | "record"
      | "milestone"
      | "completion"
      | "performance";
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
      type: "public" | "friends" | "group" | "private";
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
  type: "session_compared";
  data: {
    comparisonType: "peer" | "friend" | "leaderboard" | "global" | "historical";
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
export interface SessionSystemMaintenanceEvent extends BaseSessionCompletionEvent {
  type: "session_system_maintenance";
  data: {
    maintenanceType: "scheduled" | "emergency" | "upgrade" | "migration";
    startTime: Date;
    endTime?: Date;
    duration?: number;
    affectedServices: string[];
    impact: {
      completion: boolean;
      rewards: boolean;
      analytics: boolean;
      achievements: boolean;
    };
    message: string;
    initiatedBy: string;
  };
}
export interface SessionSystemErrorEvent extends BaseSessionCompletionEvent {
  type: "session_system_error";
  data: {
    errorType:
      | "completion_error"
      | "reward_error"
      | "analytics_error"
      | "system_error";
    errorCode: string;
    errorMessage: string;
    severity: "low" | "medium" | "high" | "critical";
    context: {
      service: string;
      operation: string;
      userId: string;
      sessionId: string;
    };
    stackTrace?: string;
    affectedUsers: number;
    recoveryAction: string;
    compensation: { type: string; amount: number; description: string };
  };
}
export type SessionCompletionEventType =
  | SessionCompletedEvent
  | SessionAbortedEvent
  | SessionTimeoutEvent
  | SessionPerformanceCalculatedEvent
  | SessionMilestoneReachedEvent
  | SessionRecordBrokenEvent
  | SessionRewardsCalculatedEvent
  | SessionRewardsClaimedEvent
  | SessionRewardMultiplierActivatedEvent
  | SessionAchievementUnlockedEvent
  | SessionAchievementProgressUpdatedEvent
  | SessionAnalyticsGeneratedEvent
  | SessionPerformanceReportEvent
  | SessionFeedbackRequestedEvent
  | SessionFeedbackSubmittedEvent
  | SessionSharedEvent
  | SessionComparedEvent
  | SessionSystemMaintenanceEvent
  | SessionSystemErrorEvent;
