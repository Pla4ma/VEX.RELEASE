import type { BaseSessionStartEvent } from "./base";
import type {
  SessionInitiatedEvent,
  SessionPreparationStartedEvent,
  SessionPreparationCompletedEvent,
  SessionConfigurationSetEvent,
} from "./base";
import type {
  SessionEnvironmentPreparedEvent,
  SessionReadinessAssessedEvent,
  SessionReadinessImprovedEvent,
  SessionReadinessInsufficientEvent,
  SessionGoalsSetEvent,
  SessionGoalsUpdatedEvent,
  SessionGoalProgressEvent,
} from "./readiness";
import type {
  SessionMoodAssessedEvent,
  SessionMoodAdjustedEvent,
  SessionContextEstablishedEvent,
  SessionContextUpdatedEvent,
} from "./mood-context";

export interface SessionStartSystemMaintenanceEvent
  extends BaseSessionStartEvent {
  type: "session_start_system_maintenance";
  data: {
    maintenanceType: "scheduled" | "emergency" | "upgrade" | "migration";
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
  type: "session_start_system_error";
  data: {
    errorType:
      | "initiation_error"
      | "preparation_error"
      | "configuration_error"
      | "system_error";
    errorCode: string;
    errorMessage: string;
    severity: "low" | "medium" | "high" | "critical";
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
  type: "session_start_analytics";
  data: {
    analyticsType:
      | "preparation"
      | "readiness"
      | "configuration"
      | "trends"
      | "insights";
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
      direction: "up" | "down" | "stable";
      change: number;
      significance: string;
    }>;
    generatedAt: Date;
  };
}

export interface SessionStartPerformanceReportEvent
  extends BaseSessionStartEvent {
  type: "session_start_performance_report";
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
