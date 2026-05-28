import type { BaseSessionCompletionEvent } from "./base-event-types";

export interface SessionPerformanceCalculatedEvent
  extends BaseSessionCompletionEvent {
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

export interface SessionAnalyticsGeneratedEvent
  extends BaseSessionCompletionEvent {
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

export interface SessionPerformanceReportEvent
  extends BaseSessionCompletionEvent {
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
