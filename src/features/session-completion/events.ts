/**
 * Session Completion Feature Events
 *
 * Event definitions for session completion, rewards, achievements, and post-session analytics.
 */

// Base Event Interface
export interface BaseSessionCompletionEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, any>;
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
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
}

// Session Lifecycle Events
export interface SessionCompletedEvent extends BaseSessionCompletionEvent {
  type: 'session_completed';
  data: {
    completionType: 'natural' | 'forced' | 'abandoned' | 'timeout' | 'achievement';
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
  type: 'session_aborted';
  data: {
    abortTime: Date;
    duration: number;
    progress: {
      percentage: number;
      objectivesCompleted: number;
      totalObjectives: number;
      currentPhase: string;
    };
    abortReason: 'user_choice' | 'technical_error' | 'timeout' | 'emergency' | 'system_intervention';
    abortContext: {
      trigger: string;
      userState: string;
      systemState: string;
    };
    recovery: {
      resumable: boolean;
      dataPreserved: boolean;
      penalty: any;
    };
  };
}

export interface SessionTimeoutEvent extends BaseSessionCompletionEvent {
  type: 'session_timeout';
  data: {
    timeoutTime: Date;
    duration: number;
    timeLimit: number;
    progress: {
      percentage: number;
      objectivesCompleted: number;
      totalObjectives: number;
    };
    timeoutType: 'soft' | 'hard' | 'grace_period';
    consequences: {
      scorePenalty: number;
      rewardReduction: number;
      experienceLoss: number;
    };
    extension: {
      available: boolean;
      granted: boolean;
      duration?: number;
      cost?: any;
    };
  };
}

// Performance Events
export interface SessionPerformanceCalculatedEvent extends BaseSessionCompletionEvent {
  type: 'session_performance_calculated';
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
  type: 'session_milestone_reached';
  data: {
    milestoneId: string;
    milestoneType: 'score' | 'streak' | 'accuracy' | 'speed' | 'completion' | 'special';
    milestoneName: string;
    achievedAt: Date;
    value: number;
    target: number;
    previousRecord: number;
    improvement: number;
    significance: 'personal' | 'session' | 'daily' | 'weekly' | 'all_time';
    recognition: {
      badge: string;
      title: string;
      celebration: boolean;
      shareable: boolean;
    };
    rewards: {
      experience: number;
      currency: number;
      items: any[];
      unlocks: string[];
    };
  };
}

export interface SessionRecordBrokenEvent extends BaseSessionCompletionEvent {
  type: 'session_record_broken';
  data: {
    recordType: string;
    recordCategory: 'personal' | 'session' | 'daily' | 'weekly' | 'global';
    previousRecord: number;
    newRecord: number;
    improvement: number;
    recordDate: Date;
    previousRecordDate: Date;
    timeSincePrevious: number;
    significance: {
      rarity: number;
      difficulty: number;
      achievement: number;
    };
    celebration: {
      message: string;
      effects: string[];
      duration: number;
      public: boolean;
    };
  };
}

// Reward Events
export interface SessionRewardsCalculatedEvent extends BaseSessionCompletionEvent {
  type: 'session_rewards_calculated';
  data: {
    baseRewards: {
      experience: number;
      currency: number;
      reputation: number;
      energy: number;
    };
    performanceBonus: {
      multiplier: number;
      bonus: {
        experience: number;
        currency: number;
        reputation: number;
      };
      criteria: string[];
    };
    completionBonus: {
      multiplier: number;
      bonus: {
        experience: number;
        currency: number;
        reputation: number;
      };
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
      items: any[];
    };
  };
}

export interface SessionRewardsClaimedEvent extends BaseSessionCompletionEvent {
  type: 'session_rewards_claimed';
  data: {
    claimedAt: Date;
    claimMethod: 'auto' | 'manual' | 'delayed';
    rewards: {
      experience: number;
      currency: number;
      reputation: number;
      items: any[];
    };
    multipliers: {
      active: any[];
      applied: any[];
      expired: any[];
    };
    bonuses: {
      streak: any;
      performance: any;
      completion: any;
      special: any[];
    };
    inventory: {
      previous: any;
      current: any;
      overflow: any;
    };
  };
}

export interface SessionRewardMultiplierActivatedEvent extends BaseSessionCompletionEvent {
  type: 'session_reward_multiplier_activated';
  data: {
    multiplierId: string;
    multiplierType: string;
    multiplierValue: number;
    duration: number;
    activatedAt: Date;
    trigger: {
      type: string;
      condition: string;
      value: any;
    };
    scope: {
      sessions: string[];
      rewards: string[];
      conditions: any[];
    };
    cost: {
      type: string;
      amount: number;
      source: string;
    };
    benefits: {
      estimated: number;
      actual?: number;
      efficiency: number;
    };
  };
}

// Achievement Events
export interface SessionAchievementUnlockedEvent extends BaseSessionCompletionEvent {
  type: 'session_achievement_unlocked';
  data: {
    achievementId: string;
    achievementName: string;
    achievementType: 'completion' | 'performance' | 'streak' | 'special' | 'hidden';
    unlockedAt: Date;
    progress: {
      current: number;
      required: number;
      percentage: number;
    };
    criteria: {
      type: string;
      condition: string;
      value: any;
      met: boolean;
    }[];
    rarity: string;
    points: number;
    rewards: {
      experience: number;
      currency: number;
      items: any[];
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
  type: 'session_achievement_progress_updated';
  data: {
    achievementId: string;
    previousProgress: number;
    currentProgress: number;
    requiredProgress: number;
    increment: number;
    contributingAction: string;
    context: {
      sessionId: string;
      objective: string;
      performance: any;
    };
    nextMilestone?: {
      progress: number;
      reward: any;
      celebration: boolean;
    };
    estimatedCompletion?: {
      sessions: number;
      timeframe: number;
      confidence: number;
    };
  };
}

// Analytics Events
export interface SessionAnalyticsGeneratedEvent extends BaseSessionCompletionEvent {
  type: 'session_analytics_generated';
  data: {
    analyticsType: 'performance' | 'progress' | 'trends' | 'predictions' | 'insights';
    timeframe: string;
    metrics: Record<string, number>;
    dimensions: Record<string, any>;
    insights: {
      type: string;
      description: string;
      significance: string;
      recommendations: string[];
    }[];
    trends: {
      metric: string;
      direction: 'up' | 'down' | 'stable';
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
  type: 'session_performance_report';
  data: {
    reportPeriod: {
      start: Date;
      end: Date;
    };
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
      byType: Record<string, any>;
      byDifficulty: Record<string, any>;
      byTimeframe: Record<string, any>;
      byObjective: Record<string, any>;
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

// Feedback Events
export interface SessionFeedbackRequestedEvent extends BaseSessionCompletionEvent {
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
    incentives: {
      type: string;
      value: number;
      condition: string;
    };
    timing: {
      immediate: boolean;
      delay: number;
      deadline?: Date;
    };
  };
}

export interface SessionFeedbackSubmittedEvent extends BaseSessionCompletionEvent {
  type: 'session_feedback_submitted';
  data: {
    feedbackId: string;
    feedbackType: string;
    submittedAt: Date;
    responses: {
      questionId: string;
      answer: any;
      timeSpent: number;
    }[];
    rating?: number;
    comment?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    context: {
      device: string;
      location?: string;
      sessionState: string;
    };
    followUp: {
      requested: boolean;
      contactMethod?: string;
      availability?: string;
    };
  };
}

// Social Events
export interface SessionSharedEvent extends BaseSessionCompletionEvent {
  type: 'session_shared';
  data: {
    shareType: 'achievement' | 'record' | 'milestone' | 'completion' | 'performance';
    sharedAt: Date;
    platform: string;
    content: {
      title: string;
      description: string;
      image?: string;
      video?: string;
      stats: any;
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
    rewards: {
      experience: number;
      currency: number;
      social: number;
    };
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

// System Events
export interface SessionSystemMaintenanceEvent extends BaseSessionCompletionEvent {
  type: 'session_system_maintenance';
  data: {
    maintenanceType: 'scheduled' | 'emergency' | 'upgrade' | 'migration';
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
  type: 'session_system_error';
  data: {
    errorType: 'completion_error' | 'reward_error' | 'analytics_error' | 'system_error';
    errorCode: string;
    errorMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: {
      service: string;
      operation: string;
      userId: string;
      sessionId: string;
    };
    stackTrace?: string;
    affectedUsers: number;
    recoveryAction: string;
    compensation: {
      type: string;
      amount: number;
      description: string;
    };
  };
}

// Union Type for All Session Completion Events
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

// Event Factory Functions
export function createSessionCompletedEvent(
  userId: string,
  sessionId: string,
  completionType: 'natural' | 'forced' | 'abandoned' | 'timeout' | 'achievement',
  duration: number,
  objectives: any,
  performance: any,
  conditions: any
): SessionCompletedEvent {
  return {
    id: generateEventId(),
    type: 'session_completed',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      completionType,
      completionTime: new Date(),
      duration,
      objectives,
      performance,
      conditions,
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function createSessionPerformanceCalculatedEvent(
  userId: string,
  sessionId: string,
  performanceMetrics: any,
  benchmarks: any,
  analysis: any
): SessionPerformanceCalculatedEvent {
  return {
    id: generateEventId(),
    type: 'session_performance_calculated',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      performanceMetrics,
      benchmarks,
      analysis,
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function createSessionRewardsCalculatedEvent(
  userId: string,
  sessionId: string,
  baseRewards: any,
  performanceBonus: any,
  completionBonus: any,
  specialRewards: any[]
): SessionRewardsCalculatedEvent {
  return {
    id: generateEventId(),
    type: 'session_rewards_calculated',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      baseRewards,
      performanceBonus,
      completionBonus,
      specialRewards,
      totalRewards: {
        experience: baseRewards.experience + performanceBonus.bonus.experience + completionBonus.bonus.experience,
        currency: baseRewards.currency + performanceBonus.bonus.currency + completionBonus.bonus.currency,
        reputation: baseRewards.reputation + performanceBonus.bonus.reputation + completionBonus.bonus.reputation,
        items: specialRewards,
      },
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function createSessionAchievementUnlockedEvent(
  userId: string,
  sessionId: string,
  achievementId: string,
  achievementName: string,
  achievementType: 'streak' | 'completion' | 'special' | 'performance' | 'hidden',
  progress: any,
  criteria: any[],
  rarity: string,
  points: number,
  rewards: any
): SessionAchievementUnlockedEvent {
  return {
    id: generateEventId(),
    type: 'session_achievement_unlocked',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      achievementId,
      achievementName,
      achievementType,
      unlockedAt: new Date(),
      progress,
      criteria,
      rarity,
      points,
      rewards,
      recognition: {
        badge: `${achievementId}_badge`,
        celebration: true,
        shareable: true,
        public: rarity === 'legendary' || rarity === 'epic',
      },
      firstTime: true,
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function createSessionMilestoneReachedEvent(
  userId: string,
  sessionId: string,
  milestoneId: string,
  milestoneType: 'score' | 'streak' | 'accuracy' | 'speed' | 'completion' | 'special',
  milestoneName: string,
  value: number,
  target: number,
  previousRecord: number,
  significance: 'personal' | 'session' | 'daily' | 'weekly' | 'all_time'
): SessionMilestoneReachedEvent {
  return {
    id: generateEventId(),
    type: 'session_milestone_reached',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      milestoneId,
      milestoneType,
      milestoneName,
      achievedAt: new Date(),
      value,
      target,
      previousRecord,
      improvement: value - previousRecord,
      significance,
      recognition: {
        badge: `${milestoneId}_badge`,
        title: `${milestoneName} Achiever`,
        celebration: true,
        shareable: true,
      },
      rewards: {
        experience: Math.floor((value / target) * 100),
        currency: Math.floor((value / target) * 50),
        items: [],
        unlocks: [],
      },
    },
    metadata: createEventMetadata('session-completion'),
  };
}

// Helper Functions
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEventMetadata(source: string): EventMetadata {
  return {
    source,
    version: '1.0.0',
    platform: getPlatform(),
  };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  // Add platform detection logic here
  return 'unknown';
}

// Event Validation
export function validateSessionCompletionEvent(event: SessionCompletionEventType): boolean {
  if (!event.id || !event.userId || !event.sessionId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'session_completed':
      return validateSessionCompletedEvent(event as SessionCompletedEvent);
    case 'session_performance_calculated':
      return validateSessionPerformanceCalculatedEvent(event as SessionPerformanceCalculatedEvent);
    case 'session_rewards_calculated':
      return validateSessionRewardsCalculatedEvent(event as SessionRewardsCalculatedEvent);
    case 'session_achievement_unlocked':
      return validateSessionAchievementUnlockedEvent(event as SessionAchievementUnlockedEvent);
    case 'session_milestone_reached':
      return validateSessionMilestoneReachedEvent(event as SessionMilestoneReachedEvent);
    default:
      return true;
  }
}

function validateSessionCompletedEvent(event: SessionCompletedEvent): boolean {
  const { data } = event;
  return !!(
    data.completionType &&
    data.completionTime &&
    typeof data.duration === 'number' &&
    data.objectives &&
    data.performance &&
    data.conditions
  );
}

function validateSessionPerformanceCalculatedEvent(event: SessionPerformanceCalculatedEvent): boolean {
  const { data } = event;
  return !!(
    data.performanceMetrics &&
    data.benchmarks &&
    data.analysis
  );
}

function validateSessionRewardsCalculatedEvent(event: SessionRewardsCalculatedEvent): boolean {
  const { data } = event;
  return !!(
    data.baseRewards &&
    data.performanceBonus &&
    data.completionBonus &&
    data.specialRewards &&
    data.totalRewards
  );
}

function validateSessionAchievementUnlockedEvent(event: SessionAchievementUnlockedEvent): boolean {
  const { data } = event;
  return !!(
    data.achievementId &&
    data.achievementName &&
    data.achievementType &&
    data.progress &&
    data.criteria &&
    data.rarity &&
    typeof data.points === 'number' &&
    data.rewards &&
    data.recognition
  );
}

function validateSessionMilestoneReachedEvent(event: SessionMilestoneReachedEvent): boolean {
  const { data } = event;
  return !!(
    data.milestoneId &&
    data.milestoneType &&
    data.milestoneName &&
    typeof data.value === 'number' &&
    typeof data.target === 'number' &&
    typeof data.previousRecord === 'number' &&
    data.significance &&
    data.recognition &&
    data.rewards
  );
}

// Event Serialization
export function serializeSessionCompletionEvent(event: SessionCompletionEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeSessionCompletionEvent(data: string): SessionCompletionEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}
