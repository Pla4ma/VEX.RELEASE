import type { EventMetadata, SessionStartEventType, SessionInitiatedEvent, SessionPreparationStartedEvent, SessionReadinessAssessedEvent, SessionGoalsSetEvent, SessionMoodAssessedEvent, SessionContextEstablishedEvent } from './types';

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEventMetadata(source: string): EventMetadata {
  return { source, version: '1.0.0', platform: getPlatform() };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') return 'web';
  return 'unknown';
}

export function createSessionInitiatedEvent(
  userId: string,
  sessionId: string,
  initiationType: SessionInitiatedEvent['data']['initiationType'],
  trigger: SessionInitiatedEvent['data']['trigger'],
  intent: SessionInitiatedEvent['data']['intent'],
  context: SessionInitiatedEvent['data']['context'],
): SessionInitiatedEvent {
  return {
    id: generateEventId(),
    type: 'session_initiated',
    userId,
    sessionId,
    timestamp: new Date(),
    data: { initiationType, initiatedAt: new Date(), trigger, intent, context },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionPreparationStartedEvent(
  userId: string,
  sessionId: string,
  preparationType: SessionPreparationStartedEvent['data']['preparationType'],
  preparationSteps: SessionPreparationStartedEvent['data']['preparationSteps'],
  environment: SessionPreparationStartedEvent['data']['environment'],
  user: SessionPreparationStartedEvent['data']['user'],
): SessionPreparationStartedEvent {
  return {
    id: generateEventId(),
    type: 'session_preparation_started',
    userId,
    sessionId,
    timestamp: new Date(),
    data: { preparationType, preparationSteps, environment, user },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionReadinessAssessedEvent(
  userId: string,
  sessionId: string,
  assessmentType: SessionReadinessAssessedEvent['data']['assessmentType'],
  readinessScore: number,
  readinessLevel: SessionReadinessAssessedEvent['data']['readinessLevel'],
  factors: SessionReadinessAssessedEvent['data']['factors'],
  trends: SessionReadinessAssessedEvent['data']['trends'],
  recommendations: SessionReadinessAssessedEvent['data']['recommendations'],
): SessionReadinessAssessedEvent {
  return {
    id: generateEventId(),
    type: 'session_readiness_assessed',
    userId,
    sessionId,
    timestamp: new Date(),
    data: { assessmentType, readinessScore, readinessLevel, factors, trends, recommendations },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionGoalsSetEvent(
  userId: string,
  sessionId: string,
  goalType: SessionGoalsSetEvent['data']['goalType'],
  goals: SessionGoalsSetEvent['data']['goals'],
  alignment: SessionGoalsSetEvent['data']['alignment'],
  planning: SessionGoalsSetEvent['data']['planning'],
): SessionGoalsSetEvent {
  return {
    id: generateEventId(),
    type: 'session_goals_set',
    userId,
    sessionId,
    timestamp: new Date(),
    data: { goalType, goals, alignment, planning },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionMoodAssessedEvent(
  userId: string,
  sessionId: string,
  assessmentType: SessionMoodAssessedEvent['data']['assessmentType'],
  moodProfile: SessionMoodAssessedEvent['data']['moodProfile'],
  moodState: SessionMoodAssessedEvent['data']['moodState'],
  influences: SessionMoodAssessedEvent['data']['influences'],
  recommendations: SessionMoodAssessedEvent['data']['recommendations'],
): SessionMoodAssessedEvent {
  return {
    id: generateEventId(),
    type: 'session_mood_assessed',
    userId,
    sessionId,
    timestamp: new Date(),
    data: { assessmentType, moodProfile, moodState, influences, recommendations },
    metadata: createEventMetadata('session-start'),
  };
}

export function createSessionContextEstablishedEvent(
  userId: string,
  sessionId: string,
  contextType: SessionContextEstablishedEvent['data']['contextType'],
  contextData: SessionContextEstablishedEvent['data']['contextData'],
  adaptations: SessionContextEstablishedEvent['data']['adaptations'],
): SessionContextEstablishedEvent {
  return {
    id: generateEventId(),
    type: 'session_context_established',
    userId,
    sessionId,
    timestamp: new Date(),
    data: { contextType, contextData, adaptations },
    metadata: createEventMetadata('session-start'),
  };
}

export function validateSessionStartEvent(event: SessionStartEventType): boolean {
  if (!event.id || !event.userId || !event.sessionId || !event.timestamp) return false;
  if (!event.data || !event.metadata) return false;

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

function validateSessionInitiatedEvent(event: SessionInitiatedEvent): boolean {
  return !!(event.data.initiationType && event.data.initiatedAt && event.data.trigger && event.data.intent && event.data.context);
}

function validateSessionPreparationStartedEvent(event: SessionPreparationStartedEvent): boolean {
  return !!(event.data.preparationType && event.data.preparationSteps && event.data.environment && event.data.user);
}

function validateSessionReadinessAssessedEvent(event: SessionReadinessAssessedEvent): boolean {
  return !!(event.data.assessmentType && typeof event.data.readinessScore === 'number' && event.data.readinessLevel && event.data.factors && event.data.trends && event.data.recommendations);
}

function validateSessionGoalsSetEvent(event: SessionGoalsSetEvent): boolean {
  return !!(event.data.goalType && event.data.goals && event.data.alignment && event.data.planning);
}

function validateSessionMoodAssessedEvent(event: SessionMoodAssessedEvent): boolean {
  return !!(event.data.assessmentType && event.data.moodProfile && event.data.moodState && event.data.influences && event.data.recommendations);
}

function validateSessionContextEstablishedEvent(event: SessionContextEstablishedEvent): boolean {
  return !!(event.data.contextType && event.data.contextData && event.data.adaptations);
}

export function serializeSessionStartEvent(event: SessionStartEventType): string {
  return JSON.stringify({ ...event, timestamp: event.timestamp.toISOString() });
}

export function deserializeSessionStartEvent(data: string): SessionStartEventType {
  const parsed = JSON.parse(data) as SessionStartEventType;
  return { ...parsed, timestamp: new Date(parsed.timestamp as unknown as string) };
}
