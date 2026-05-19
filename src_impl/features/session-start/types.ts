export interface BaseSessionStartEvent {
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
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
}

export interface SessionInitiatedEvent extends BaseSessionStartEvent {
  type: 'session_initiated';
  data: {
    initiationType: 'manual' | 'auto' | 'scheduled' | 'triggered';
    initiatedAt: Date;
    trigger: {
      source: string;
      context: string;
      parameters: Record<string, unknown>;
    };
    intent: {
      primary: string;
      secondary: string[];
      goals: string[];
      expectations: string[];
    };
    context: {
      previousSession?: string;
      timeSinceLastSession: number;
      currentStreak: number;
      userState: string;
    };
  };
}

export interface SessionPreparationStartedEvent extends BaseSessionStartEvent {
  type: 'session_preparation_started';
  data: {
    preparationType: 'standard' | 'quick' | 'comprehensive' | 'custom';
    preparationSteps: Array<{
      step: string;
      required: boolean;
      estimatedDuration: number;
      dependencies: string[];
    }>;
    environment: {
      setupRequired: string[];
      checks: string[];
      optimizations: string[];
    };
    user: {
      readiness: number;
      mood: string;
      energy: number;
      focus: number;
      motivation: number;
    };
  };
}

export interface SessionPreparationCompletedEvent extends BaseSessionStartEvent {
  type: 'session_preparation_completed';
  data: {
    completedAt: Date;
    duration: number;
    stepsCompleted: string[];
    stepsSkipped: string[];
    stepsFailed: string[];
    finalReadiness: {
      score: number;
      factors: Record<string, number>;
      recommendations: string[];
    };
    environment: {
      optimized: boolean;
      issues: string[];
      adjustments: string[];
    };
  };
}

export interface SessionConfigurationSetEvent extends BaseSessionStartEvent {
  type: 'session_configuration_set';
  data: {
    configurationType: 'difficulty' | 'duration' | 'objectives' | 'environment' | 'accessibility';
    configuration: {
      settings: Record<string, unknown>;
      constraints: Record<string, unknown>;
      preferences: Record<string, unknown>;
    };
    validation: {
      valid: boolean;
      errors: string[];
      warnings: string[];
      suggestions: string[];
    };
    personalization: {
      adapted: boolean;
      adaptations: string[];
      confidence: number;
    };
  };
}

export interface SessionEnvironmentPreparedEvent extends BaseSessionStartEvent {
  type: 'session_environment_prepared';
  data: {
    environmentType: 'physical' | 'digital' | 'mixed';
    preparationSteps: Array<{
      step: string;
      status: 'completed' | 'skipped' | 'failed';
      duration: number;
      result: Record<string, unknown>;
    }>;
    finalState: {
      lighting: number;
      noise: number;
      temperature: number;
      comfort: number;
      distraction: number;
      accessibility: number;
    };
    optimizations: {
      applied: string[];
      skipped: string[];
      failed: string[];
    };
  };
}

export interface SessionReadinessAssessedEvent extends BaseSessionStartEvent {
  type: 'session_readiness_assessed';
  data: {
    assessmentType: 'comprehensive' | 'quick' | 'targeted';
    readinessScore: number;
    readinessLevel: 'low' | 'medium' | 'high' | 'optimal';
    factors: Array<{
      factor: string;
      score: number;
      weight: number;
      impact: string;
      recommendations: string[];
    }>;
    trends: {
      current: number;
      previous: number;
      trend: 'improving' | 'declining' | 'stable';
      significance: string;
    };
    recommendations: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
  };
}

export interface SessionReadinessImprovedEvent extends BaseSessionStartEvent {
  type: 'session_readiness_improved';
  data: {
    improvementType: 'preparation' | 'exercise' | 'break' | 'environment' | 'motivation';
    previousScore: number;
    currentScore: number;
    improvement: number;
    activities: Array<{
      activity: string;
      duration: number;
      effectiveness: number;
      result: Record<string, unknown>;
    }>;
    factors: {
      improved: string[];
      maintained: string[];
      declined: string[];
    };
    nextAssessment: {
      recommended: boolean;
      timeframe: number;
      focus: string[];
    };
  };
}

export interface SessionReadinessInsufficientEvent extends BaseSessionStartEvent {
  type: 'session_readiness_insufficient';
  data: {
    thresholdType: 'minimum' | 'recommended' | 'optimal';
    currentScore: number;
    requiredScore: number;
    gap: number;
    criticalFactors: Array<{
      factor: string;
      current: number;
      required: number;
      impact: string;
    }>;
    recommendations: {
      quick: string[];
      comprehensive: string[];
      alternative: string[];
    };
    options: {
      proceed: boolean;
      delay: boolean;
      modify: boolean;
      cancel: boolean;
    };
  };
}

export interface SessionGoalsSetEvent extends BaseSessionStartEvent {
  type: 'session_goals_set';
  data: {
    goalType: 'primary' | 'secondary' | 'stretch' | 'maintenance';
    goals: Array<{
      id: string;
      type: string;
      description: string;
      target: Record<string, unknown>;
      priority: string;
      measurable: boolean;
      achievable: boolean;
      relevant: boolean;
      timebound: boolean;
    }>;
    alignment: {
      userGoals: string[];
      systemRecommendations: string[];
      conflicts: string[];
      synergies: string[];
    };
    planning: {
      strategy: string;
      milestones: string[];
      resources: string[];
      contingencies: string[];
    };
  };
}

export interface SessionGoalsUpdatedEvent extends BaseSessionStartEvent {
  type: 'session_goals_updated';
  data: {
    updateType: 'addition' | 'modification' | 'removal' | 'reordering' | 'reprioritization';
    changes: Array<{
      goalId: string;
      changeType: string;
      oldValue: Record<string, unknown>;
      newValue: Record<string, unknown>;
      reason: string;
    }>;
    impact: {
      difficulty: number;
      duration: number;
      resources: number;
      successProbability: number;
    };
    validation: {
      valid: boolean;
      conflicts: string[];
      recommendations: string[];
    };
  };
}

export interface SessionGoalProgressEvent extends BaseSessionStartEvent {
  type: 'session_goal_progress';
  data: {
    goalId: string;
    progressType: 'milestone' | 'increment' | 'setback' | 'completion';
    currentProgress: number;
    targetProgress: number;
    increment: number;
    context: {
      activity: string;
      performance: number;
      factors: string[];
    };
    impact: {
      motivation: number;
      confidence: number;
      momentum: number;
    };
    nextMilestone?: {
      progress: number;
      estimated: number;
      actions: string[];
    };
  };
}

export interface SessionMoodAssessedEvent extends BaseSessionStartEvent {
  type: 'session_mood_assessed';
  data: {
    assessmentType: 'self_report' | 'behavioral' | 'physiological' | 'comprehensive';
    moodProfile: {
      energy: number;
      focus: number;
      motivation: number;
      stress: number;
      confidence: number;
      creativity: number;
      social: number;
    };
    moodState: 'optimal' | 'good' | 'neutral' | 'suboptimal' | 'poor';
    influences: {
      factors: string[];
      sources: string[];
      timing: string[];
    };
    recommendations: {
      immediate: string[];
      session: string[];
      postSession: string[];
    };
  };
}

export interface SessionMoodAdjustedEvent extends BaseSessionStartEvent {
  type: 'session_mood_adjusted';
  data: {
    adjustmentType: 'preparation' | 'intervention' | 'environment' | 'social' | 'personal';
    adjustmentMethod: string;
    previousMood: Record<string, unknown>;
    currentMood: Record<string, unknown>;
    changes: Array<{
      dimension: string;
      change: number;
      significance: string;
    }>;
    activities: Array<{
      activity: string;
      duration: number;
      effectiveness: number;
    }>;
    sustainability: {
      duration: number;
      maintenance: string[];
      reinforcement: string[];
    };
  };
}

export interface SessionContextEstablishedEvent extends BaseSessionStartEvent {
  type: 'session_context_established';
  data: {
    contextType: 'personal' | 'environmental' | 'social' | 'temporal' | 'situational';
    contextData: {
      personal: {
        preferences: Record<string, unknown>;
        history: Record<string, unknown>;
        patterns: Record<string, unknown>;
      };
      environmental: {
        location: string;
        conditions: string;
        resources: string[];
      };
      social: {
        alone: boolean;
        company: string[];
        interactions: string[];
      };
      temporal: {
        timeOfDay: string;
        dayOfWeek: string;
        season: string;
        schedule: string;
      };
      situational: {
        preceding: string;
        following: string;
        constraints: string[];
        opportunities: string[];
      };
    };
    adaptations: {
      automatic: string[];
      manual: string[];
      suggested: string[];
    };
  };
}

export interface SessionContextUpdatedEvent extends BaseSessionStartEvent {
  type: 'session_context_updated';
  data: {
    updateType: 'environmental' | 'personal' | 'social' | 'system' | 'external';
    changes: Array<{
      aspect: string;
      previousValue: Record<string, unknown>;
      newValue: Record<string, unknown>;
      impact: string;
      timestamp: Date;
    }>;
    implications: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    adaptations: {
      applied: string[];
      pending: string[];
      rejected: string[];
    };
  };
}

export interface SessionStartSystemMaintenanceEvent extends BaseSessionStartEvent {
  type: 'session_start_system_maintenance';
  data: {
    maintenanceType: 'scheduled' | 'emergency' | 'upgrade' | 'migration';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    affectedServices: string[];
    impact: {
      initiation: boolean;
      preparation: boolean;
      configuration: boolean;
      readiness: boolean;
    };
    message: string;
    initiatedBy: string;
  };
}

export interface SessionStartSystemErrorEvent extends BaseSessionStartEvent {
  type: 'session_start_system_error';
  data: {
    errorType: 'initiation_error' | 'preparation_error' | 'configuration_error' | 'system_error';
    errorCode: string;
    errorMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: {
      service: string;
      operation: string;
      userId: string;
      sessionId: string;
      step?: string;
    };
    stackTrace?: string;
    affectedUsers: number;
    recoveryAction: string;
    userImpact: string;
  };
}

export interface SessionStartAnalyticsEvent extends BaseSessionStartEvent {
  type: 'session_start_analytics';
  data: {
    analyticsType: 'preparation' | 'readiness' | 'configuration' | 'trends' | 'insights';
    timeframe: string;
    metrics: Record<string, number>;
    dimensions: Record<string, unknown>;
    insights: Array<{
      type: string;
      description: string;
      significance: string;
      recommendations: string[];
    }>;
    trends: Array<{
      metric: string;
      direction: 'up' | 'down' | 'stable';
      change: number;
      significance: string;
    }>;
    generatedAt: Date;
  };
}

export interface SessionStartPerformanceReportEvent extends BaseSessionStartEvent {
  type: 'session_start_performance_report';
  data: {
    reportPeriod: { start: Date; end: Date };
    overview: {
      totalSessions: number;
      initiatedSessions: number;
      completedPreparation: number;
      averageReadiness: number;
      averagePreparationTime: number;
      successRate: number;
    };
    preparation: {
      byType: Record<string, unknown>;
      byDuration: Record<string, unknown>;
      byReadiness: Record<string, unknown>;
      byGoal: Record<string, unknown>;
    };
    readiness: {
      trends: Array<{ date: Date; score: number }>;
      factors: Record<string, number>;
      improvements: string[];
      challenges: string[];
    };
    efficiency: {
      preparationTime: Array<{ date: Date; time: number }>;
      readinessImprovement: Array<{ date: Date; improvement: number }>;
      goalAlignment: Array<{ date: Date; alignment: number }>;
    };
    insights: {
      strengths: string[];
      improvements: string[];
      opportunities: string[];
      recommendations: string[];
    };
  };
}

export type SessionStartEventType =
  | SessionInitiatedEvent
  | SessionPreparationStartedEvent
  | SessionPreparationCompletedEvent
  | SessionConfigurationSetEvent
  | SessionEnvironmentPreparedEvent
  | SessionReadinessAssessedEvent
  | SessionReadinessImprovedEvent
  | SessionReadinessInsufficientEvent
  | SessionGoalsSetEvent
  | SessionGoalsUpdatedEvent
  | SessionGoalProgressEvent
  | SessionMoodAssessedEvent
  | SessionMoodAdjustedEvent
  | SessionContextEstablishedEvent
  | SessionContextUpdatedEvent
  | SessionStartSystemMaintenanceEvent
  | SessionStartSystemErrorEvent
  | SessionStartAnalyticsEvent
  | SessionStartPerformanceReportEvent;
