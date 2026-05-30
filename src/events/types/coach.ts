/**
 * Coach Events
 */

export interface CoachEventDefinitions {
  "coach:comeback_activated": {
    userId: string;
    planId: string;
    targetSessions: number;
    bonusMultiplier: number;
    expiresAt: number;
  };
  "coach:comeback_detected": {
    userId: string;
    previousStreak?: number;
    comebackStreak?: number;
  };
  "coach:difficulty_adjusted": {
    userId: string;
    newDifficulty: number;
    reason: string;
  };
  "coach:message_sent": {
    userId: string;
    messageId: string;
    category: string;
  };
  "coach:recommendation_accepted": {
    userId: string;
    recommendationId: string;
  };
  "coach:intervention_triggered": {
    userId: string;
    interventionId: string;
    type: string;
  };
  "coach:intervention_dismissed": {
    userId: string;
    interventionId: string;
    type: string;
  };
  "coach:intervention_actioned": {
    userId: string;
    interventionId: string;
    type: string;
    actionLabel: string;
  };
  "coach:streak_at_risk": {
    userId: string;
    hoursRemaining?: number;
    riskLevel: string;
    streak?: number;
  };
  "coach:streak_at_risk_session": {
    userId: string;
    sessionId: string;
    config: {
      duration: number;
      difficulty: string;
      sessionType: string;
      source: string;
      context: {
        coachReasoning: string;
        userStreakDays?: number;
        isStreakAtRisk?: boolean;
      };
    };
    skipSetup?: boolean;
    mode?: string;
    strictMode?: boolean;
  };
  "coach:session_triggered": {
    userId: string;
    sessionId: string;
    config: {
      duration: number;
      difficulty: string;
      sessionType: string;
      source: string;
      context: {
        coachReasoning: string;
        userStreakDays?: number;
        isStreakAtRisk?: boolean;
        isComebackMode?: boolean;
        optimalTimeWindow?: boolean;
      };
    };
  };
  "coach:trigger": {
    userId: string;
    trigger?: string;
    triggerType?: string;
    context?: Record<string, unknown>;
    data?: Record<string, unknown>;
  };
  "coach:session_feedback": {
    userId: string;
    sessionId: string;
    duration: number;
    quality: number;
    streakDay: number;
  };
  "coach:message": {
    userId: string;
    message: string;
    type: string;
    timestamp: number;
  };
  "coach:profile_initialized": {
    userId: string;
    profileId: string;
    timestamp: number;
  };
  "coach:messages_queued": {
    userId: string;
    messages: Array<{
      id: string;
      type: string;
      content: string;
      priority: number;
    }>;
    timestamp: number;
  };
  "coach:memory_created": {
    userId: string;
    memoryId: string;
    type: string;
    occurredAt: number;
    timestamp: number;
  };
  "coach:intent": {
    userId: string;
    context?: string;
    message?: string;
    triggerType?: string;
    timestamp?: number;
  };
}
