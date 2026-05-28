import type { BaseSessionStartEvent } from "./base";

export interface SessionEnvironmentPreparedEvent extends BaseSessionStartEvent {
  type: "session_environment_prepared";
  data: {
    environmentType: "physical" | "digital" | "mixed";
    preparationSteps: Array<{
      step: string;
      status: "completed" | "skipped" | "failed";
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
    optimizations: { applied: string[]; skipped: string[]; failed: string[] };
  };
}

export interface SessionReadinessAssessedEvent extends BaseSessionStartEvent {
  type: "session_readiness_assessed";
  data: {
    assessmentType: "comprehensive" | "quick" | "targeted";
    readinessScore: number;
    readinessLevel: "low" | "medium" | "high" | "optimal";
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
      trend: "improving" | "declining" | "stable";
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
  type: "session_readiness_improved";
  data: {
    improvementType:
      | "preparation"
      | "exercise"
      | "break"
      | "environment"
      | "motivation";
    previousScore: number;
    currentScore: number;
    improvement: number;
    activities: Array<{
      activity: string;
      duration: number;
      effectiveness: number;
      result: Record<string, unknown>;
    }>;
    factors: { improved: string[]; maintained: string[]; declined: string[] };
    nextAssessment: {
      recommended: boolean;
      timeframe: number;
      focus: string[];
    };
  };
}

export interface SessionReadinessInsufficientEvent
  extends BaseSessionStartEvent {
  type: "session_readiness_insufficient";
  data: {
    thresholdType: "minimum" | "recommended" | "optimal";
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
  type: "session_goals_set";
  data: {
    goalType: "primary" | "secondary" | "stretch" | "maintenance";
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
  type: "session_goals_updated";
  data: {
    updateType:
      | "addition"
      | "modification"
      | "removal"
      | "reordering"
      | "reprioritization";
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
  type: "session_goal_progress";
  data: {
    goalId: string;
    progressType: "milestone" | "increment" | "setback" | "completion";
    currentProgress: number;
    targetProgress: number;
    increment: number;
    context: { activity: string; performance: number; factors: string[] };
    impact: { motivation: number; confidence: number; momentum: number };
    nextMilestone?: { progress: number; estimated: number; actions: string[] };
  };
}
