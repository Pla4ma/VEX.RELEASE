import { capture } from "../../shared/analytics/analytics-service";


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