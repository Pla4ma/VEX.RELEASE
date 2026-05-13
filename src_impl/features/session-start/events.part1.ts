import { SessionStartEvent } from "./types";


export function createSessionInitiatedEvent(userId: string, sessionId: string, initiationType: 'manual' | 'auto' | 'scheduled' | 'triggered', trigger: DynamicValue, intent: DynamicValue, context: DynamicValue): SessionInitiatedEvent {
  return {
    id: generateEventId(),
    type: 'session_initiated',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      initiationType,
      initiatedAt: new Date(),
      trigger,
      intent,
      context,
    },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionPreparationStartedEvent(userId: string, sessionId: string, preparationType: 'standard' | 'quick' | 'comprehensive' | 'custom', preparationSteps: DynamicValue[], environment: DynamicValue, user: DynamicValue): SessionPreparationStartedEvent {
  return {
    id: generateEventId(),
    type: 'session_preparation_started',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      preparationType,
      preparationSteps,
      environment,
      user,
    },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionReadinessAssessedEvent(userId: string, sessionId: string, assessmentType: 'comprehensive' | 'quick' | 'targeted', readinessScore: number, readinessLevel: 'low' | 'medium' | 'high' | 'optimal', factors: DynamicValue[], trends: DynamicValue, recommendations: DynamicValue): SessionReadinessAssessedEvent {
  return {
    id: generateEventId(),
    type: 'session_readiness_assessed',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      assessmentType,
      readinessScore,
      readinessLevel,
      factors,
      trends,
      recommendations,
    },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionGoalsSetEvent(userId: string, sessionId: string, goalType: 'primary' | 'secondary' | 'stretch' | 'maintenance', goals: DynamicValue[], alignment: DynamicValue, planning: DynamicValue): SessionGoalsSetEvent {
  return {
    id: generateEventId(),
    type: 'session_goals_set',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      goalType,
      goals,
      alignment,
      planning,
    },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionMoodAssessedEvent(userId: string, sessionId: string, assessmentType: 'self_report' | 'behavioral' | 'physiological' | 'comprehensive', moodProfile: DynamicValue, moodState: 'optimal' | 'good' | 'neutral' | 'suboptimal' | 'poor', influences: DynamicValue, recommendations: DynamicValue): SessionMoodAssessedEvent {
  return {
    id: generateEventId(),
    type: 'session_mood_assessed',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      assessmentType,
      moodProfile,
      moodState,
      influences,
      recommendations,
    },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionContextEstablishedEvent(userId: string, sessionId: string, contextType: 'personal' | 'environmental' | 'social' | 'temporal' | 'situational', contextData: DynamicValue, adaptations: DynamicValue): SessionContextEstablishedEvent {
  return {
    id: generateEventId(),
    type: 'session_context_established',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      contextType,
      contextData,
      adaptations,
    },
    metadata: createEventMetadata('session-start'),
  };
}

export function validateSessionStartEvent(event: SessionStartEventType): boolean {
  if (!event.id || !event.userId || !event.sessionId || !event.timestamp) {
    return false;
  }

  if (!event.data || !event.metadata) {
    return false;
  }

  // Discriminated union switch on event.type
  switch (event.type) {
    case 'session_initiated':
      return validateSessionInitiatedEvent(event);
    case 'session_preparation_started':
      return validateSessionPreparationStartedEvent(event);
    case 'session_readiness_assessed':
      return validateSessionReadinessAssessedEvent(event);
    case 'session_goals_set':
      return validateSessionGoalsSetEvent(event);
    case 'session_mood_assessed':
      return validateSessionMoodAssessedEvent(event);
    case 'session_context_established':
      return validateSessionContextEstablishedEvent(event);
    default:
      return true;
  }
}

export function serializeSessionStartEvent(event: SessionStartEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeSessionStartEvent(data: string): SessionStartEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}