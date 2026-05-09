/**
 * Session Completion Feature Analytics
 *
 * Comprehensive analytics tracking for session completion, rewards, achievements, and post-session analytics.
 */

import { capture } from '../../shared/analytics/analytics-service';

// ============================================================================
// SESSION LIFECYCLE ANALYTICS
// ============================================================================

export function trackSessionCompleted(
  userId: string,
  sessionId: string,
  completionType: 'natural' | 'forced' | 'abandoned' | 'timeout' | 'achievement',
  duration: number,
  objectives: {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
    percentage: number;
  },
  performance: {
    overallScore: number;
    accuracy: number;
    efficiency: number;
    speed: number;
    consistency: number;
  },
  conditions: {
    success: boolean;
    failureReason?: string;
    completionCriteria: string[];
    metCriteria: string[];
    missedCriteria: string[];
  },
): void {
  capture('session_completion_completed', {
    user_id: userId,
    session_id: sessionId,
    completion_type: completionType,
    duration,
    objectives,
    performance,
    conditions,
  });
}

export function trackSessionAborted(
  userId: string,
  sessionId: string,
  abortTime: Date,
  duration: number,
  progress: {
    percentage: number;
    objectivesCompleted: number;
    totalObjectives: number;
    currentPhase: string;
  },
  abortReason: 'user_choice' | 'technical_error' | 'timeout' | 'emergency' | 'system_intervention',
  abortContext: {
    trigger: string;
    userState: string;
    systemState: string;
  },
  recovery: {
    resumable: boolean;
    dataPreserved: boolean;
    penalty: unknown;
  },
): void {
  capture('session_completion_aborted', {
    user_id: userId,
    session_id: sessionId,
    abort_time: abortTime.toISOString(),
    duration,
    progress,
    abort_reason: abortReason,
    abort_context: abortContext,
    recovery,
  });
}

export function trackSessionTimeout(
  userId: string,
  sessionId: string,
  timeoutTime: Date,
  duration: number,
  timeLimit: number,
  progress: {
    percentage: number;
    objectivesCompleted: number;
    totalObjectives: number;
  },
  timeoutType: 'soft' | 'hard' | 'grace_period',
  consequences: {
    scorePenalty: number;
    rewardReduction: number;
    experienceLoss: number;
  },
  extension: {
    available: boolean;
    granted: boolean;
    duration?: number;
    cost?: unknown;
  },
): void {
  capture('session_completion_timeout', {
    user_id: userId,
    session_id: sessionId,
    timeout_time: timeoutTime.toISOString(),
    duration,
    time_limit: timeLimit,
    progress,
    timeout_type: timeoutType,
    consequences,
    extension,
  });
}

// ============================================================================
// PERFORMANCE ANALYTICS
// ============================================================================

export function trackSessionPerformanceCalculated(
  userId: string,
  sessionId: string,
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
  },
  benchmarks: {
    personalBest: number;
    personalAverage: number;
    globalAverage: number;
    peerAverage: number;
    targetLevel: number;
  },
  analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    insights: string[];
  },
): void {
  capture('session_completion_performance_calculated', {
    user_id: userId,
    session_id: sessionId,
    performance_metrics: performanceMetrics,
    benchmarks,
    analysis,
  });
}

export function trackSessionMilestoneReached(
  userId: string,
  sessionId: string,
  milestoneId: string,
  milestoneType: 'score' | 'streak' | 'accuracy' | 'speed' | 'completion' | 'special',
  milestoneName: string,
  value: number,
  target: number,
  previousRecord: number,
  improvement: number,
  significance: 'personal' | 'session' | 'daily' | 'weekly' | 'all_time',
  recognition: {
    badge: string;
    title: string;
    celebration: boolean;
    shareable: boolean;
  },
  rewards: {
    experience: number;
    currency: number;
    items: unknown[];
    unlocks: string[];
  },
): void {
  capture('session_completion_milestone_reached', {
    user_id: userId,
    session_id: sessionId,
    milestone_id: milestoneId,
    milestone_type: milestoneType,
    milestone_name: milestoneName,
    value,
    target,
    previous_record: previousRecord,
    improvement,
    significance,
    recognition,
    rewards,
  });
}

export function trackSessionRecordBroken(
  userId: string,
  sessionId: string,
  recordType: string,
  recordCategory: 'personal' | 'session' | 'daily' | 'weekly' | 'global',
  previousRecord: number,
  newRecord: number,
  improvement: number,
  recordDate: Date,
  previousRecordDate: Date,
  timeSincePrevious: number,
  significance: {
    rarity: number;
    difficulty: number;
    achievement: number;
  },
  celebration: {
    message: string;
    effects: string[];
    duration: number;
    public: boolean;
  },
): void {
  capture('session_completion_record_broken', {
    user_id: userId,
    session_id: sessionId,
    record_type: recordType,
    record_category: recordCategory,
    previous_record: previousRecord,
    new_record: newRecord,
    improvement,
    record_date: recordDate.toISOString(),
    previous_record_date: previousRecordDate.toISOString(),
    time_since_previous: timeSincePrevious,
    significance,
    celebration,
  });
}

// ============================================================================
// REWARDS ANALYTICS
// ============================================================================

export function trackSessionRewardsCalculated(
  userId: string,
  sessionId: string,
  baseRewards: {
    experience: number;
    currency: number;
    reputation: number;
    energy: number;
  },
  performanceBonus: {
    multiplier: number;
    bonus: {
      experience: number;
      currency: number;
      reputation: number;
    };
    criteria: string[];
  },
  completionBonus: {
    multiplier: number;
    bonus: {
      experience: number;
      currency: number;
      reputation: number;
    };
    objectives: string[];
  },
  specialRewards: {
    type: string;
    name: string;
    value: number;
    rarity: string;
    condition: string;
  }[],
  totalRewards: {
    experience: number;
    currency: number;
    reputation: number;
    items: unknown[];
  },
): void {
  capture('session_completion_rewards_calculated', {
    user_id: userId,
    session_id: sessionId,
    base_rewards: baseRewards,
    performance_bonus: performanceBonus,
    completion_bonus: completionBonus,
    special_rewards: specialRewards,
    total_rewards: totalRewards,
  });
}

export function trackSessionRewardsClaimed(
  userId: string,
  sessionId: string,
  claimedAt: Date,
  claimMethod: 'auto' | 'manual' | 'delayed',
  rewards: {
    experience: number;
    currency: number;
    reputation: number;
    items: unknown[];
  },
  multipliers: {
    active: unknown[];
    applied: unknown[];
    expired: unknown[];
  },
  bonuses: {
    streak: unknown;
    performance: unknown;
    completion: unknown;
    special: unknown[];
  },
  inventory: {
    previous: unknown;
    current: unknown;
    overflow: unknown;
  },
): void {
  capture('session_completion_rewards_claimed', {
    user_id: userId,
    session_id: sessionId,
    claimed_at: claimedAt.toISOString(),
    claim_method: claimMethod,
    rewards,
    multipliers,
    bonuses,
    inventory,
  });
}

export function trackSessionRewardMultiplierActivated(
  userId: string,
  sessionId: string,
  multiplierId: string,
  multiplierType: string,
  multiplierValue: number,
  duration: number,
  activatedAt: Date,
  trigger: {
    type: string;
    condition: string;
    value: unknown;
  },
  scope: {
    sessions: string[];
    rewards: string[];
    conditions: unknown[];
  },
  cost: {
    type: string;
    amount: number;
    source: string;
  },
  benefits: {
    estimated: number;
    actual?: number;
    efficiency: number;
  },
): void {
  capture('session_completion_reward_multiplier_activated', {
    user_id: userId,
    session_id: sessionId,
    multiplier_id: multiplierId,
    multiplier_type: multiplierType,
    multiplier_value: multiplierValue,
    duration,
    activated_at: activatedAt.toISOString(),
    trigger,
    scope,
    cost,
    benefits,
  });
}

// ============================================================================
// ACHIEVEMENT ANALYTICS
// ============================================================================

export function trackSessionAchievementUnlocked(
  userId: string,
  sessionId: string,
  achievementId: string,
  achievementName: string,
  achievementType: 'completion' | 'performance' | 'streak' | 'special' | 'hidden',
  progress: {
    current: number;
    required: number;
    percentage: number;
  },
  criteria: {
    type: string;
    condition: string;
    value: unknown;
    met: boolean;
  }[],
  rarity: string,
  points: number,
  rewards: {
    experience: number;
    currency: number;
    items: unknown[];
    titles: string[];
  },
  recognition: {
    badge: string;
    celebration: boolean;
    shareable: boolean;
    public: boolean;
  },
  firstTime: boolean,
  chainProgress?: {
    chainId: string;
    current: number;
    total: number;
    next: string;
  },
): void {
  capture('session_completion_achievement_unlocked', {
    user_id: userId,
    session_id: sessionId,
    achievement_id: achievementId,
    achievement_name: achievementName,
    achievement_type: achievementType,
    progress,
    criteria,
    rarity,
    points,
    rewards,
    recognition,
    first_time: firstTime,
    chain_progress: chainProgress,
  });
}

export function trackSessionAchievementProgressUpdated(
  userId: string,
  sessionId: string,
  achievementId: string,
  previousProgress: number,
  currentProgress: number,
  requiredProgress: number,
  increment: number,
  contributingAction: string,
  context: {
    sessionId: string;
    objective: string;
    performance: unknown;
  },
  nextMilestone?: {
    progress: number;
    reward: unknown;
    celebration: boolean;
  },
  estimatedCompletion?: {
    sessions: number;
    timeframe: number;
    confidence: number;
  },
): void {
  capture('session_completion_achievement_progress_updated', {
    user_id: userId,
    session_id: sessionId,
    achievement_id: achievementId,
    previous_progress: previousProgress,
    current_progress: currentProgress,
    required_progress: requiredProgress,
    increment,
    contributing_action: contributingAction,
    context,
    next_milestone: nextMilestone,
    estimated_completion: estimatedCompletion,
  });
}

// ============================================================================
// FEEDBACK ANALYTICS
// ============================================================================

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

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export function trackSessionCompletionFunnel(userId: string, step: 'session_started' | 'objectives_met' | 'performance_calculated' | 'rewards_earned' | 'achievement_unlocked' | 'completed'): void {
  capture('session_completion_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
